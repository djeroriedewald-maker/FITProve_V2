import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import App from './App';

describe('App', () => {
  it('renders headline', () => {
    render(<App />);
    // Expect brand title present in header
    const headline = screen.getByText(/FITProve/i);
    expect(headline).toBeInTheDocument();
  });
});
