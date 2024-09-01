import React, { useState, useEffect } from 'react';
import Card from './Card';
import Spinner from '../Spinner';
import { HStack, VStack, Flex, Heading } from '@chakra-ui/react';

interface Card {
  value: number;
  suit: string;
}

interface Props {
  numberOfTurns: number;
  player1Deck: Card[];
  player2Deck: Card[];
  houseDeck: Card[];
  gameOver: boolean;
  currentUser: string;
  player1Chips: number;
  player2Chips: number;
  turn: string;
  winner: string;
  player1Name: string;
  player2Name: string;
}

export default function Cards({
  numberOfTurns,
  player1Deck,
  player2Deck,
  houseDeck,
  gameOver,
  currentUser,
  player1Chips,
  player2Chips,
  turn,
  winner,
  player1Name,
  player2Name,
}: Props) {}