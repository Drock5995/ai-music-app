import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ArtistForm from '../ArtistForm';

describe('ArtistForm', () => {
  test('happy path: submits transformed artist data', () => {
    const onSave = jest.fn();
    render(<ArtistForm onSave={onSave} />);

    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    const genreInput = screen.getByLabelText(/Genre/i) as HTMLInputElement;
    const influencesInput = screen.getByLabelText(/Influences/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Test Artist' } });
    fireEvent.change(genreInput, { target: { value: 'Indie' } });
    fireEvent.change(influencesInput, { target: { value: 'A, B, C' } });

    const saveButton = screen.getByRole('button', { name: /save artist/i });
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledTimes(1);
    const saved = onSave.mock.calls[0][0];
    expect(saved.name).toBe('Test Artist');
    expect(saved.genre).toBe('Indie');
    expect(Array.isArray(saved.influences)).toBe(true);
    expect(saved.influences).toEqual(['A', 'B', 'C']);
  });

  test('shows validation errors when required fields are missing', () => {
    const onSave = jest.fn();
    const { container } = render(<ArtistForm onSave={onSave} />);

    const form = container.querySelector('form') as HTMLFormElement;
    fireEvent.submit(form);

    const alerts = screen.getAllByRole('alert');
    // Expect both name and genre errors to appear
    const texts = alerts.map(a => a.textContent || '');
    expect(texts).toEqual(expect.arrayContaining(['Name is required', 'Genre is required']));
    expect(onSave).not.toHaveBeenCalled();
  });
});
