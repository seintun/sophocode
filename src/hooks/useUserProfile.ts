'use client';

import { useState, useEffect } from 'react';

interface UserProfile {
  currentStreak: number;
  longestStreak: number;
  lastActivityAt: string | null;
  coins: number;
  tier: 'FREE' | 'PREMIUM';
}

const DEFAULT_PROFILE: UserProfile = {
  currentStreak: 0,
  longestStreak: 0,
  lastActivityAt: null,
  coins: 0,
  tier: 'FREE',
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((data: UserProfile) => setProfile(data))
      .catch(() => {});
  }, []);

  return profile;
}
