import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

// Custom hook for managing reports
export const useReports = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchReports();
    } else {
      setReports([]);
      setLoading(false);
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        throw error;
      }
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      addNotification({
        type: 'error',
        title: 'Error Loading Reports',
        message: 'Failed to load reports. Please try again.'
      });
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const addReport = async (reportData) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([{ ...reportData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setReports(prev => [data, ...prev]);
      
      addNotification({
        type: 'success',
        title: 'Report Generated',
        message: `${reportData.title} has been generated successfully`
      });
      
      return data;
    } catch (error) {
      console.error('Error adding report:', error);
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: 'Failed to generate report. Please try again.'
      });
      throw error;
    }
  };

  const deleteReport = async (id) => {
    try {
      const report = reports.find(r => r.id === id);
      
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setReports(prev => prev.filter(r => r.id !== id));
      
      if (report) {
        addNotification({
          type: 'success',
          title: 'Report Deleted',
          message: `${report.title} has been deleted`
        });
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete report. Please try again.'
      });
      throw error;
    }
  };

  return {
    reports,
    loading,
    addReport,
    deleteReport,
    refetch: fetchReports
  };
};