import { Redirect } from 'expo-router';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function Index() {
  const { hasCompletedOnboarding } = useSelector((state: RootState) => state.onboarding);

  return <Redirect href={hasCompletedOnboarding ? '/welcome' : '/onboarding'} />;
}