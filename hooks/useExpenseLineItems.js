/**
 * useExpenseLineItems Hook
 * Manages itemized Insurance / Subscriptions line items per expense scope
 */

import { useState, useEffect, useRef } from 'react';
import { loadFromCookie, saveToCookie } from '../lib/cookieStorage';
import {
  createEmptyLineItems,
  getManageableCategories,
  loadExpenseLineItemsForScope,
} from '../lib/expenseLineItems';

const noop = () => {};

export function useExpenseLineItems(isInitialized = true, scope = 'shared', enabled = true) {
  const [lineItems, setLineItems] = useState(() => createEmptyLineItems(scope));
  const [isLoading, setIsLoading] = useState(enabled);
  const saveTimeoutRef = useRef(null);
  const scopeRef = useRef(scope);
  const lineItemsRef = useRef(lineItems);
  const skipNextSaveRef = useRef(false);

  lineItemsRef.current = lineItems;

  useEffect(() => {
    if (!enabled) {
      setLineItems(createEmptyLineItems(scope));
      setIsLoading(false);
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    if (isInitialized && scopeRef.current !== scope) {
      const existingData = loadFromCookie('AUDIT_DASHBOARD_DATA') || {};
      saveToCookie('AUDIT_DASHBOARD_DATA', {
        ...existingData,
        expenseLineItems: {
          ...(existingData.expenseLineItems || {}),
          [scopeRef.current]: lineItemsRef.current,
        },
      }, 365);
    }

    scopeRef.current = scope;

    const savedData = loadFromCookie('AUDIT_DASHBOARD_DATA') || {};
    skipNextSaveRef.current = true;
    setLineItems(loadExpenseLineItemsForScope(savedData, scope));
    setIsLoading(false);
  }, [scope, isInitialized, enabled]);

  useEffect(() => {
    if (!enabled || isLoading || !isInitialized) return;

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      const existingData = loadFromCookie('AUDIT_DASHBOARD_DATA') || {};
      saveToCookie('AUDIT_DASHBOARD_DATA', {
        ...existingData,
        expenseLineItems: {
          ...(existingData.expenseLineItems || {}),
          [scopeRef.current]: lineItemsRef.current,
        },
      }, 365);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [lineItems, isLoading, isInitialized, enabled]);

  const setCategoryItems = enabled
    ? (category, items) => {
        setLineItems((prev) => ({ ...prev, [category]: items }));
      }
    : noop;

  const addItem = enabled
    ? (category) => {
        setLineItems((prev) => ({
          ...prev,
          [category]: [
            ...(prev[category] || []),
            { id: Date.now().toString(), name: '', amount: '' },
          ],
        }));
      }
    : noop;

  const updateItem = enabled
    ? (category, id, field, value) => {
        setLineItems((prev) => ({
          ...prev,
          [category]: (prev[category] || []).map((item) =>
            item.id === id ? { ...item, [field]: value } : item
          ),
        }));
      }
    : noop;

  const removeItem = enabled
    ? (category, id) => {
        setLineItems((prev) => ({
          ...prev,
          [category]: (prev[category] || []).filter((item) => item.id !== id),
        }));
      }
    : noop;

  return {
    lineItems: enabled ? lineItems : createEmptyLineItems(scope),
    manageableCategories: getManageableCategories(scope),
    isLoading: enabled ? isLoading : false,
    setCategoryItems,
    addItem,
    updateItem,
    removeItem,
  };
}
