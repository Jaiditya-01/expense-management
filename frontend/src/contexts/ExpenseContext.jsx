import React, { createContext, useContext, useState, useEffect } from 'react';
import { expenseAPI } from '../services/api';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext();

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadExpenses();
      loadCountries();
    }
  }, [user]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const response = await expenseAPI.getExpenses();
      setExpenses(response.data);
    } catch (error) {
      console.error('Failed to load expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const response = await expenseAPI.getCountries();
      setCountries(response.data);
    } catch (error) {
      console.error('Failed to load countries:', error);
    }
  };

  const submitExpense = async (expenseData) => {
    try {
      const response = await expenseAPI.submitExpense(expenseData);
      setExpenses(prev => [response.data, ...prev]);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.msg || 'Failed to submit expense' 
      };
    }
  };

  const updateExpense = async (id, data) => {
    try {
      const response = await expenseAPI.updateExpense(id, data);
      setExpenses(prev => 
        prev.map(expense => 
          expense._id === id ? response.data : expense
        )
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.msg || 'Failed to update expense' 
      };
    }
  };

  const deleteExpense = async (id) => {
    try {
      await expenseAPI.deleteExpense(id);
      setExpenses(prev => prev.filter(expense => expense._id !== id));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.msg || 'Failed to delete expense' 
      };
    }
  };

  const approveExpense = async (id, action, comment = '') => {
    try {
      const response = await expenseAPI.approveExpense(id, action, comment);
      setExpenses(prev => 
        prev.map(expense => 
          expense._id === id ? response.data : expense
        )
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.msg || 'Failed to process approval' 
      };
    }
  };

  const getExpensesByStatus = (status) => {
    return expenses.filter(expense => expense.status === status);
  };

  const getPendingApprovals = () => {
    return expenses.filter(expense => 
      expense.status === 'pending' && 
      (user?.role === 'Admin' || 
       (user.role === 'Manager' && expense.approvalLevel === 'manager'))
    );
  };

  const value = {
    expenses,
    countries,
    loading,
    loadExpenses,
    submitExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    getExpensesByStatus,
    getPendingApprovals
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};
