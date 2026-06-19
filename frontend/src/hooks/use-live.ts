'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'https://mvp-backend-little-woodland-6494.fly.dev';

function createSocket(): Socket {
  return io(`${SOCKET_URL}/live`, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
    randomizationFactor: 0.5,
    timeout: 10000,
  });
}

interface UseLiveMatchResult {
  connected: boolean;
  matchUpdate: any;
  scoreUpdate: any;
}

export function useLiveMatch(matchId: string | null): UseLiveMatchResult {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [matchUpdate, setMatchUpdate] = useState<any>(null);
  const [scoreUpdate, setScoreUpdate] = useState<any>(null);

  useEffect(() => {
    if (!matchId) return;

    const socket = createSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('joinMatch', matchId);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('matchUpdated', (data: any) => setMatchUpdate(data));
    socket.on('scoreUpdated', (data: any) => setScoreUpdate(data));
    socket.on('matchStarted', (data: any) => setMatchUpdate(data));
    socket.on('matchFinished', (data: any) => setMatchUpdate(data));
    socket.on('matchCancelled', (data: any) => setMatchUpdate(data));

    return () => {
      socket.emit('leaveMatch', matchId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [matchId]);

  return { connected, matchUpdate, scoreUpdate };
}

interface UseLiveEventResult {
  connected: boolean;
  matchUpdate: any;
}

export function useLiveEvent(eventId: string | null): UseLiveEventResult {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [matchUpdate, setMatchUpdate] = useState<any>(null);

  useEffect(() => {
    if (!eventId) return;

    const socket = createSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('joinEvent', eventId);
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('matchUpdated', (data: any) => setMatchUpdate(data));

    return () => {
      socket.emit('leaveEvent', eventId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [eventId]);

  return { connected, matchUpdate };
}

interface UseLiveOrganizationResult {
  connected: boolean;
  matchUpdate: any;
}

export function useLiveOrganization(organizationId: string | null): UseLiveOrganizationResult {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [matchUpdate, setMatchUpdate] = useState<any>(null);

  useEffect(() => {
    if (!organizationId) return;

    const socket = createSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('joinOrganization', organizationId);
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('matchUpdated', (data: any) => setMatchUpdate(data));

    return () => {
      socket.emit('leaveOrganization', organizationId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [organizationId]);

  return { connected, matchUpdate };
}

interface UseLiveSportResult {
  connected: boolean;
  matchUpdate: any;
  scoreUpdate: any;
  standingsUpdate: any;
  playoffsUpdate: any;
  championUpdate: any;
}

export function useLiveSport(eventSportId: string | null): UseLiveSportResult {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [matchUpdate, setMatchUpdate] = useState<any>(null);
  const [scoreUpdate, setScoreUpdate] = useState<any>(null);
  const [standingsUpdate, setStandingsUpdate] = useState<any>(null);
  const [playoffsUpdate, setPlayoffsUpdate] = useState<any>(null);
  const [championUpdate, setChampionUpdate] = useState<any>(null);

  useEffect(() => {
    if (!eventSportId) return;

    const socket = createSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('joinSport', eventSportId);
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('matchUpdated', (data: any) => setMatchUpdate(data));
    socket.on('scoreUpdated', (data: any) => setScoreUpdate(data));
    socket.on('standingsUpdated', (data: any) => setStandingsUpdate(data));
    socket.on('playoffsUpdated', (data: any) => setPlayoffsUpdate(data));
    socket.on('championDefined', (data: any) => setChampionUpdate(data));

    return () => {
      socket.emit('leaveSport', eventSportId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [eventSportId]);

  return { connected, matchUpdate, scoreUpdate, standingsUpdate, playoffsUpdate, championUpdate };
}
