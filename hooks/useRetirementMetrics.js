/**
 * Retirement Metrics Hook
 * Consolidates retirement data loading and calculation logic
 * Eliminates code duplication in pages that need retirement projections
 */

import { useMemo } from 'react';
import { loadFromCookie } from '../lib/cookieStorage';
import { generateForwardProjection, generateBackwardProjection, calculateMonthlyInvestmentBackward } from '../lib/retirementCalculator';

/**
 * Load and calculate retirement metrics from cookie storage
 * Handles forward/backward calculation modes and returns breakdown data
 * 
 * @returns {object} Retirement metrics object
 * @returns {number} .retirementProjection - Final projected balance at retirement
 * @returns {object} .retirementBreakdown - {contributions, gains} breakdown
 * @returns {number} .monthlyInvestment - Required or planned monthly investment
 */
export function useRetirementMetrics() {
  const retirementMetrics = useMemo(() => {
    const retirementData = loadFromCookie('AUDIT_RETIREMENT_DATA');
    
    if (!retirementData) {
      return {
        retirementProjection: 0,
        retirementBreakdown: { contributions: 0, gains: 0 },
        monthlyInvestment: 0,
      };
    }

    const isBackward = retirementData.calculationType === 'backward';
    
    // Generate projection based on calculation type
    const projectionArray = isBackward
      ? generateBackwardProjection(
          retirementData.currentAge || '30',
          retirementData.retirementAge || '65',
          retirementData.goalBalance || '500000',
          retirementData.annualReturn || '7',
          retirementData.currentBalance || '0'
        )
      : generateForwardProjection(
          retirementData.currentAge || '30',
          retirementData.retirementAge || '65',
          retirementData.monthlyInvestment || '1000',
          retirementData.annualReturn || '7',
          retirementData.currentBalance || '0'
        );
    
    // Extract final projection data
    const finalProjection = projectionArray[projectionArray.length - 1];
    let retirementBreakdown = { contributions: 0, gains: 0 };
    
    if (finalProjection) {
      retirementBreakdown = {
        contributions: finalProjection.contributions,
        gains: finalProjection.gains,
      };
    }
    
    // Calculate monthly investment requirement
    let monthlyInvest = 0;
    if (isBackward) {
      monthlyInvest = calculateMonthlyInvestmentBackward(
        retirementData.goalBalance || 500000,
        retirementData.currentAge || 30,
        retirementData.retirementAge || 65,
        retirementData.annualReturn || 7,
        retirementData.currentBalance || 0
      );
    } else {
      monthlyInvest = Math.floor(parseFloat(retirementData.monthlyInvestment) || 0);
    }

    return {
      retirementProjection: finalProjection?.balance || 0,
      retirementBreakdown,
      monthlyInvestment: monthlyInvest,
    };
  }, []);

  return retirementMetrics;
}
