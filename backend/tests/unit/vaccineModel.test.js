const Vaccine = require('../../models/Vaccine');

describe('Vaccine Model', () => {
  it('deve criar uma instância válida', () => {
    const vaccine = new Vaccine({
      petId: '507f1f77bcf86cd799439011',
      name: 'Raiva',
      date: new Date()
    });

    expect(vaccine.name).toBe('Raiva');
    expect(vaccine.petId).toBeDefined();
    expect(vaccine.date).toBeDefined();
  });

  it('deve retornar false quando nextDueDate não existir', () => {
    const vaccine = new Vaccine({
      petId: '507f1f77bcf86cd799439011',
      name: 'Raiva',
      date: new Date()
    });

    expect(vaccine.isOverdue).toBe(false);
  });

  it('deve retornar true quando a vacina estiver vencida', () => {
    const vaccine = new Vaccine({
      petId: '507f1f77bcf86cd799439011',
      name: 'Raiva',
      date: new Date(),
      nextDueDate: new Date('2020-01-01')
    });

    expect(vaccine.isOverdue).toBe(true);
  });

  it('deve possuir os campos obrigatórios', () => {
    const schema = Vaccine.schema.paths;

    expect(schema.petId).toBeDefined();
    expect(schema.name).toBeDefined();
    expect(schema.date).toBeDefined();
  });

  it('deve referenciar o model Pet', () => {
    expect(
      Vaccine.schema.paths.petId.options.ref
    ).toBe('Pet');
  });
});