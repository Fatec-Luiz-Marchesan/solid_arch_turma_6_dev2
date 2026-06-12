describe('PoC - Jest Coverage Tool', () => {

    test('soma de 2 + 2 deve ser 4', () => {
        expect(2 + 2).toBe(4)
    })

    test('string deve conter texto', () => {
        const mensagem = 'Jest funcionando!'
        expect(mensagem).toContain('Jest')
    })

    test('o objeto deve ter priopridade', () => {
        const pet = { nome: 'Rex', idade: 4 }
        expect(pet).toHaveProperty('nome')
        expect(pet.nome).toBe('Rex')
    })
})



