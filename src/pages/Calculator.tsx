import {useState,useEffect} from 'react';
import type {MouseEvent as ReactMouseEvent} from 'react';

interface CalcState{
    display:string;
    acc:number|null;
    op:string|null,
    expr:string;
    fresh:boolean;
}

const initialState:CalcState={display:"0",acc:null,op:null,expr:'',fresh:true}
const errorState:CalcState={display:"Error",acc:null,op:null,expr:'',fresh:true}

const operators=['+','-','x','/']
const keys=[
    'C','erase',"%","/",
    '7','8','9','x',
    '4','5','6','-',
    '1','2','3','+',
    '0','.','='

]
