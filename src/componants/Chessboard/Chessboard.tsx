import "./Chessboard.css";
import Tile from "../Tile/Tile";
import React, { useRef, useState } from "react";
import Referee from "../../referee/Referee";

const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];

interface Piece {
  image: string;
  x: number;
  y: number;
  type: PieceType;
  team: TeamType;
}
export enum TeamType {
  OPPONENT,
  OUR,
}
export enum PieceType {
  PAWN,
  BISHOP,
  QUEEN,
  KING,
  KNIGHT,
  ROOK,
}
const initialBoardState: Piece[] = [];

for (let i = 0; i < 8; i++) {
  initialBoardState.push({
    image: "assets/images/Chess_pdt60.png",
    x: i,
    y: 6,
    type: PieceType.PAWN,
    team: TeamType.OPPONENT,
  });
}
for (let i = 0; i < 8; i++) {
  initialBoardState.push({
    image: "assets/images/Chess_plt60.png",
    x: i,
    y: 1,
    type: PieceType.PAWN,
    team: TeamType.OUR,
  });
}

for (let p = 0; p < 2; p++) {
  const teamType = p === 0 ? TeamType.OPPONENT : TeamType.OUR;
  const type = teamType === TeamType.OPPONENT ? "d" : "l";
  const y = teamType === TeamType.OPPONENT ? 7 : 0;

  //Rooks
  initialBoardState.push({
    image: `assets/images/Chess_r${type}t60.png`,
    x: 0,
    y,
    type: PieceType.ROOK,
    team: teamType,
  });
  initialBoardState.push({
    image: `assets/images/Chess_r${type}t60.png`,
    x: 7,
    y,
    type: PieceType.ROOK,
    team: teamType,
  });

  //knights
  initialBoardState.push({
    image: `assets/images/Chess_n${type}t60.png`,
    x: 1,
    y,
    type: PieceType.KNIGHT,
    team: teamType,
  });
  initialBoardState.push({
    image: `assets/images/Chess_n${type}t60.png`,
    x: 6,
    y,
    type: PieceType.KNIGHT,
    team: teamType,
  });

  //Bishops
  initialBoardState.push({
    image: `assets/images/Chess_b${type}t60.png`,
    x: 2,
    y,
    type: PieceType.BISHOP,
    team: teamType,
  });
  initialBoardState.push({
    image: `assets/images/Chess_b${type}t60.png`,
    x: 5,
    y,
    type: PieceType.BISHOP,
    team: teamType,
  });

  //King and Queen both black and white
  initialBoardState.push({
    image: `assets/images/Chess_k${type}t60.png`,
    x: 4,
    y,
    type: PieceType.KING,
    team: teamType,
  });
  initialBoardState.push({
    image: `assets/images/Chess_q${type}t60.png`,
    x: 3,
    y,
    type: PieceType.QUEEN,
    team: teamType,
  });
}

export default function Chessboard() {
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [gridX, setGridX] = useState(0);
  const [gridY, setGridY] = useState(0);
  const referee = new Referee();
  const [pieces, setPieces] = useState<Piece[]>(initialBoardState);
  const chessboardRef = useRef<HTMLDivElement>(null);

  function grabPiece(e: React.MouseEvent) {
    const element = e.target as HTMLElement;
    const chessboard = chessboardRef.current;

    if (element.classList.contains("chess-piece") && chessboard) {
      setGridX(Math.floor((e.clientX - chessboard.offsetLeft) / 100));
      setGridY(
        Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800) / 100)),
      );

      const x = e.clientX - 50;
      const y = e.clientY - 50;

      element.style.position = "absolute";
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;

      setActivePiece(element);
    }
  }

  function movePiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;
    if (activePiece && chessboard) {
      const minX = chessboard.offsetLeft - 25;
      const minY = chessboard.offsetTop - 25;
      const maxX = chessboard.offsetLeft + chessboard.clientWidth - 75;
      const maxY = chessboard.offsetTop + chessboard.clientHeight - 75;
      const x = e.clientX - 50;
      const y = e.clientY - 50;

      activePiece.style.position = "absolute";

      if (x < minX) {
        activePiece.style.left = `${minX}px`;
      } else if (x > maxX) {
        activePiece.style.left = `${maxX}px`;
      } else {
        activePiece.style.left = `${x}px`;
      }

      if (y < minY) {
        activePiece.style.top = `${minY}px`;
      } else if (y > maxY) {
        activePiece.style.top = `${maxY}px`;
      } else {
        activePiece.style.top = `${y}px`;
      }
    }
  }

  function dropPiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;

    if (activePiece && chessboard) {
      const x = Math.floor((e.clientX - chessboard.offsetLeft) / 100);
      const y = Math.abs(
        Math.ceil((e.clientY - chessboard.offsetTop - 800) / 100),
      );

      setPieces((value) => {
        const pieces = value.map((p) => {
          if (p.x === gridX && p.y === gridY) {
            const validMove = referee.isValidMove(
              gridX,
              gridY,
              x,
              y,
              p.type,
              p.team,
            );

            if (validMove) {
              p.x = x;
              p.y = y;
            } else {
              activePiece.style.position = "relative";
              activePiece.style.removeProperty("top");
              activePiece.style.removeProperty("left");
            }
          }
          return p;
        });
        return pieces;
      });
      setActivePiece(null);
    }
  }

  let board = [];

  for (let j = verticalAxis.length - 1; j >= 0; j--) {
    for (let i = 0; i < horizontalAxis.length; i++) {
      const number = j + i + 2;

      let image = undefined;

      pieces.forEach((p) => {
        if (p.x === i && p.y === j) {
          image = p.image;
        }
      });

      board.push(<Tile key={`${j},${i}`} image={image} number={number} />);
    }
  }

  return (
    <div
      onMouseMove={(e) => movePiece(e)}
      onMouseDown={(e) => grabPiece(e)}
      onMouseUp={(e) => dropPiece(e)}
      id="chessboard"
      ref={chessboardRef}
    >
      {board}
    </div>
  );
}
