import React from 'react';
import {createRoot} from 'react-dom/client';
import BuyingApp from './buying-app';
createRoot(document.getElementById('root')!).render(<BuyingApp signInPath="./"/>);
