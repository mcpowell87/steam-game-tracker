import Home from "./pages/home";
import Test from "./pages/test";
import { Route } from './types';

export const routes: Array<Route> = [
    {
        key: 'home-route-default',
        title: 'Home',
        path: '/',
        enabled: true,
        component: Home
    },
    {
        key: 'home-route',
        title: 'Home',
        path: '/:steamId?',
        enabled: true,
        component: Home
    },
    {
        key: 'test-route',
        title: 'Test',
        path: '/test',
        enabled: true,
        component: Test
    }
]