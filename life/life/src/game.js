import React from 'react';
import './game.css'
import Cell from './cell'

const CELL_SIZE = 20;
const WIDTH = 800;
const HEIGHT = 600;


class Game extends React.Component {
    constructor() {
        super();
        this.rows = HEIGHT / this.state.cellSize;
        this.cols = WIDTH / this.state.cellSize;
        this.board = this.startingBoard();
    }

    state = {
        cells: [],
        interval: 100,
        isRunning: false,
        cellColor: 'black',
        cellSize: 20
    }

    startingBoard() {
        let board = [];
        for (let y = 0; y < this.rows; y++) {
            board[y] = [];
            for (let x = 0; x < this.cols; x++) {
                board[y][x] = false;
            }
        }

        return board;
    }

    createCells() {
        let cells = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.board[y][x]) {
                    cells.push({ x, y });
                }
            }
        }

        return cells;
    }

    getElementOffset() {
        const rect = this.boardRef.getBoundingClientRect();
        const doc = document.documentElement;
        return {
            x: (rect.left + window.pageXOffset) - doc.clientLeft,
            y: (rect.top + window.pageYOffset) - doc.clientTop
        };
    }

    handleClick = (event) => {
        const elemOffset = this.getElementOffset();
        const offsetX = event.clientX - elemOffset.x;
        const offsetY = event.clientY - elemOffset.y;
        const x = Math.floor(offsetX / CELL_SIZE);
        const y = Math.floor(offsetY / CELL_SIZE);
        if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {
            this.board[y][x] = !this.board[y][x];
        }
        this.setState({
            cells: this.createCells()
        });
    }

    //check state of neighbors to determine rules
    checkCellState(board, x, y) {
        let cellNeighbor = 0;
        const directions = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
        for (let i = 0; i < directions.length; i++) {
            const direction1 = directions[i];
            let x1 = x + direction1[1];
            let y1 = y + direction1[0];
            if (x1 >= 0 && x1 < this.cols && y1 >= 0 && y1 < this.rows && board[y1][x1]) {
                cellNeighbor++;
            }
        }
        return cellNeighbor
    }

    runIteration() {
        let newBoard = this.startingBoard();

        //RULES VVVVVVVV

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                let callNeighbor = this.checkCellState(this.board, x, y);
                if (this.board[y][x]) {
                    if (callNeighbor === 2 || callNeighbor === 3) {
                        newBoard[y][x] = true;
                    } else {
                        newBoard[y][x] = false;
                    }
                } else {
                    if (!this.board[y][x] && callNeighbor === 3) {
                        newBoard[y][x] = true;
                    }
                }
            }
        }
        this.board = newBoard;
        this.setState({ cells: this.createCells() })
        this.timeoutHandler = window.setTimeout(() => {
            this.runIteration();
        }, this.state.interval);
    }

    startGame = () => {
        this.setState({ isRunning: true });
        console.log("starting");
        this.runIteration();
    }

    stopGame = () => {
        this.setState({ isRunning: false });
        console.log("stopping");
        if (this.timeoutHandler) {
            window.clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }
    }

    handleIntervalChange = (event) => {
        this.setState({ interval: event.target.value })
    }

    handleSize = (event) => {
        this.setState({ cellSize: event.target.value })
    }

    randomButton = () => {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.board[y][x] = (Math.random() >= 0.5);
            }
        }

        this.setState({ cells: this.createCells() });
    }

    render() {
        const { cells, interval, isRunning, cellColor } = this.state;
        return (
            <div>

                <div className="Board" style={{ width: WIDTH, height: HEIGHT, backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`, background: this.state.cellColor }} onClick={this.handleClick} ref={(n) => { this.boardRef = n; }}>

                    {cells.map(cell => (
                        <Cell x={cell.x} y={cell.y} key={`${cell.x},${cell.y}`} />
                    ))}
                    
                </div>

                <div className="settings">
                    Run iteration every <input value={this.state.interval} onChange={this.handleIntervalChange} /> MilliSecs
            <button className="button" onClick={this.stopGame}>Stop Game</button>
            <button className="button" onClick={this.startGame}>Run Game</button>
            <button className="button" onClick={this.randomButton}>Random</button>
            <div className="colorField">
                Set grid size <input value={this.state.cellSize} onChange={this.handleSize} />
            </div>

                </div>
                <div className="about">
                    <h1>About</h1>
                    <p>1) Any live cell with two or three live neighbours survives.</p>
<p>2) Any dead cell with three live neighbours becomes a live cell.</p>
<p>3) All other live cells die in the next generation. Similarly, all other dead cells stay dead.</p>
                </div>

            </div>
        );
    }
}

export default Game;