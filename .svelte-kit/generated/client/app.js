export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18')
];

export const server_loads = [2];

export const dictionary = {
		"/": [4],
		"/(app)/bookmarks": [5,[2]],
		"/check-email": [~14],
		"/(app)/create": [~6,[2]],
		"/(protected)/dashboard": [13,[3]],
		"/(app)/explore": [7,[2]],
		"/forgot-password": [15],
		"/(app)/home": [8,[2]],
		"/login": [16],
		"/(app)/messages": [9,[2]],
		"/(app)/notifications": [10,[2]],
		"/(app)/profile": [~11,[2]],
		"/(app)/profile/[username]": [12,[2]],
		"/reset-password": [17],
		"/verify-email": [18]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),

	reroute: (() => {})
};

export { default as root } from '../root.js';