import Foundation
import HealthKit

struct HealthKitSwimWorkout: Identifiable, Equatable {
    var id: String
    var date: String
    var metrics: SwimMetrics
    var startDate: Date
    var endDate: Date
}

enum HealthKitServiceError: LocalizedError {
    case unavailable
    case authorizationDenied

    var errorDescription: String? {
        switch self {
        case .unavailable:
            return "Apple Health is not available on this device."
        case .authorizationDenied:
            return "Apple Health access was denied. Enable it in Settings → Health → Data Access."
        }
    }
}

enum HealthKitService {
    private static let store = HKHealthStore()

    /// Cap HealthKit samples loaded per sync to avoid memory spikes.
    static let queryLimit = 120

    private static let readTypes: Set<HKObjectType> = {
        var types = Set<HKObjectType>()
        types.insert(HKObjectType.workoutType())
        if let distance = HKQuantityType.quantityType(forIdentifier: .distanceSwimming) {
            types.insert(distance)
        }
        if let energy = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) {
            types.insert(energy)
        }
        return types
    }()

    static var isAvailable: Bool {
        HKHealthStore.isHealthDataAvailable()
    }

    static var isAuthorizedForWorkouts: Bool {
        guard isAvailable else { return false }
        let status = store.authorizationStatus(for: HKObjectType.workoutType())
        return status == .sharingAuthorized
    }

    static func requestAuthorization() async throws {
        guard isAvailable else { throw HealthKitServiceError.unavailable }
        try await store.requestAuthorization(toShare: [], read: readTypes)
    }

    /// Fetches swim workouts not yet imported. Heart rate is omitted during bulk import to
    /// avoid one statistics query per workout (major memory + query amplification).
    static func fetchNewSwimWorkouts(
        excluding existingUUIDs: Set<String>,
        since: Date,
        maxResults: Int,
        queryLimit: Int = queryLimit
    ) async throws -> (workouts: [HealthKitSwimWorkout], queriedCount: Int) {
        guard isAvailable else { throw HealthKitServiceError.unavailable }

        let workoutPredicate = HKQuery.predicateForWorkouts(with: .swimming)
        let datePredicate = HKQuery.predicateForSamples(
            withStart: since,
            end: nil,
            options: .strictStartDate
        )
        let predicate = NSCompoundPredicate(andPredicateWithSubpredicates: [
            workoutPredicate,
            datePredicate,
        ])

        let rawWorkouts = try await queryWorkouts(predicate: predicate, limit: queryLimit)
        var mapped: [HealthKitSwimWorkout] = []
        mapped.reserveCapacity(min(rawWorkouts.count, maxResults))

        for workout in rawWorkouts {
            let mappedWorkout = mapWorkout(workout)
            guard !existingUUIDs.contains(mappedWorkout.id) else { continue }
            mapped.append(mappedWorkout)
        }

        mapped.sort { $0.startDate < $1.startDate }
        if mapped.count > maxResults {
            mapped = Array(mapped.prefix(maxResults))
        }

        return (mapped, rawWorkouts.count)
    }

    private static func queryWorkouts(predicate: NSPredicate, limit: Int) async throws -> [HKWorkout] {
        try await withCheckedThrowingContinuation { continuation in
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
            let query = HKSampleQuery(
                sampleType: .workoutType(),
                predicate: predicate,
                limit: limit,
                sortDescriptors: [sort]
            ) { _, samples, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }
                let workouts = (samples as? [HKWorkout]) ?? []
                continuation.resume(returning: workouts)
            }
            store.execute(query)
        }
    }

    private static func mapWorkout(_ workout: HKWorkout) -> HealthKitSwimWorkout {
        let durationSec = max(0, Int(workout.duration.rounded()))
        let distanceM = workout.totalDistance.map { Int($0.doubleValue(for: .meter()).rounded()) }
        let activeKcal = workout.totalEnergyBurned.map { Int($0.doubleValue(for: .kilocalorie()).rounded()) }

        var paceSecPer100m: Int?
        if let distanceM, distanceM > 0, durationSec > 0 {
            paceSecPer100m = Int((Double(durationSec) / Double(distanceM)) * 100.0)
        }

        let date = dateKeyFormatter.string(from: workout.startDate)
        let timeRange = "\(timeFormatter.string(from: workout.startDate))–\(timeFormatter.string(from: workout.endDate))"
        let location: String
        if let swimLocation = workout.metadata?[HKMetadataKeySwimmingLocationType] as? Int,
           swimLocation == HKWorkoutSwimmingLocationType.openWater.rawValue {
            location = "Open water"
        } else {
            location = ""
        }

        return HealthKitSwimWorkout(
            id: workout.uuid.uuidString,
            date: date,
            metrics: SwimMetrics(
                durationSec: durationSec > 0 ? durationSec : nil,
                distanceM: distanceM,
                activeKcal: activeKcal,
                totalKcal: activeKcal,
                paceSecPer100m: paceSecPer100m,
                avgHeartRate: nil,
                laps: nil,
                poolLengthM: 25,
                goalM: nil,
                location: location,
                timeRange: timeRange,
                strokes: .empty
            ),
            startDate: workout.startDate,
            endDate: workout.endDate
        )
    }

    private static let dateKeyFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        return formatter
    }()

    private static let timeFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        return formatter
    }()
}
