import React from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import OperatorDashboard from './dashboards/OperatorDashboard';
import DriverDashboard from './dashboards/DriverDashboard';
import SupplierDashboard from './dashboards/SupplierDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(' ')[0] || 'User';

  const renderDashboard = () => {
    switch (user?.role) {
      case 'driver':
        return <DriverDashboard userName={firstName} />;
      case 'supplier':
        return <SupplierDashboard userName={firstName} companyName={user?.company_name} />;
      case 'operator':
      default:
        return <OperatorDashboard userName={firstName} />;
    }
  };

  return (
    <Layout>
      {renderDashboard()}
    </Layout>
  );
};

export default Dashboard;