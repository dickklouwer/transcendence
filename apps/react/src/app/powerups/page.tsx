"use client";

// PongGame.js
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Bat } from './bat';
import { GameManager } from './gameManager';

const socket = io(`http://${window.location.host}/power-up`, { path: "/ws/socket.io" });

const Pong = (): JSX.Element => {
    // const [matchState, setMatchState] = useState<Match.Status>(
    //     Match.Status.Queue
    // );
    // const [players, setPlayers] = useState<Profile.Instance[]>([]);
    // const [score, setScore] = useState<[number, number]>([0, 0]);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    let Manager: GameManager;

	useEffect(() => {
        if (!socket) return;
        if (canvasRef.current === null) return;

        const context = canvasRef.current.getContext("2d");
		if (context === null) return;

		Manager = new GameManager(context, socket);

		socket.on("newBatPosition", (res: any) => {
            Manager.updateBat(res.posY, res.playerUid);
        });

