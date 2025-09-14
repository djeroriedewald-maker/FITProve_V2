import '@testing-library/jest-dom';

// Polyfill window.matchMedia for jsdom
if (typeof window !== 'undefined') {
	// Always ensure matchMedia is a function in the test environment
	if (typeof (window as any).matchMedia !== 'function') {
		(window as any).matchMedia = (query: string) => {
			return {
				matches: false,
				media: query,
				onchange: null,
				addListener: () => {}, // deprecated
				removeListener: () => {}, // deprecated
				addEventListener: () => {},
				removeEventListener: () => {},
				dispatchEvent: () => false,
			} as MediaQueryList;
		};
	}
}