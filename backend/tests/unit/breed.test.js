const { validateBreed } = require('../../helpers/breedValidation');

describe('Breed Validation', () => {

  test('deve retornar erro quando name estiver vazio', () => {
    const result = validateBreed({
      species: 'dog'
    });

    expect(result).toBe('Breed name is required');
  });

  test('deve retornar erro quando species estiver vazio', () => {
    const result = validateBreed({
      name: 'Golden Retriever'
    });

    expect(result).toBe('Species is required');
  });

  test('deve retornar erro para species inválida', () => {
    const result = validateBreed({
      name: 'Golden Retriever',
      species: 'bird'
    });

    expect(result).toBe('Invalid species');
  });

  test('deve validar dados corretos', () => {
    const result = validateBreed({
      name: 'Golden Retriever',
      species: 'dog'
    });

    expect(result).toBeNull();
  });

});
