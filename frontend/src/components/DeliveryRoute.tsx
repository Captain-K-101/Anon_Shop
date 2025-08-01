import React, { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface DeliveryRouteProps {
  children: ReactNode
}

const DeliveryRoute: React.FC<DeliveryRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'DELIVERY') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default DeliveryRoute 