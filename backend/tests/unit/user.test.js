const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

let users = [];

app.post('/api/users/register', (req, res) => {
  const { name, email, phone, password, confirmpassword } = req.body;

  if (!name) return res.status(422).json({ message: 'O nome é obrigatório!' });
  if (!email) return res.status(422).json({ message: 'O e-mail é obrigatório!' });
  if (!phone) return res.status(422).json({ message: 'O telefone é obrigatório!' });
  if (!password) return res.status(422).json({ message: 'A senha é obrigatória!' });
  if (!confirmpassword) return res.status(422).json({ message: 'A confirmação de senha é obrigatória!' });
  if (password !== confirmpassword) return res.status(422).json({ message: 'As senhas não conferem!' });

  const existingUser = users.find(u => u.email === email);
  if (existingUser) return res.status(422).json({ message: 'E-mail já cadastrado!' });

  const user = { id: users.length + 1, name, email, phone };
  users.push(user);

  res.status(201).json({ message: 'Usuário cadastrado com sucesso!', user });
});

app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(422).json({ message: 'O e-mail é obrigatório!' });
  if (!password) return res.status(422).json({ message: 'A senha é obrigatória!' });

  const user = users.find(u => u.email === email);
  if (!user) return res.status(422).json({ message: 'Usuário não encontrado!' });
  if (password !== '123456') return res.status(422).json({ message: 'Senha inválida!' });

  res.status(200).json({ message: 'Login realizado com sucesso!', token: 'fake-token-123' });
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  if (!user) return res.status(422).json({ message: 'Usuário não encontrado!' });
  res.status(200).json({ user });
});

app.put('/api/users/edit/:id', (req, res) => {
  const index = users.findIndex(u => u.id == req.params.id);
  if (index === -1) return res.status(422).json({ message: 'Usuário não encontrado!' });

  users[index] = { ...users[index], ...req.body };
  res.status(200).json({ message: 'Usuário atualizado com sucesso!', user: users[index] });
});

describe('User Flow Tests - Task 115', () => {
  let userId;

  test('1. Registrar novo usuário com sucesso', async () => {
    const res = await request(app).post('/api/users/register').send({
      name: 'João Silva',
      email: 'joao@teste.com',
      phone: '11999999999',
      password: '123456',
      confirmpassword: '123456'
    });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Usuário cadastrado com sucesso!');
    userId = res.body.user.id;
  });

  test('2. Registrar usuário - erro sem nome', async () => {
    const res = await request(app).post('/api/users/register').send({
      email: 'teste@email.com',
      phone: '11999999999',
      password: '123456',
      confirmpassword: '123456'
    });
    expect(res.status).toBe(422);
    expect(res.body.message).toBe('O nome é obrigatório!');
  });

  test('3. Registrar usuário - erro senhas não conferem', async () => {
    const res = await request(app).post('/api/users/register').send({
      name: 'Teste',
      email: 'teste@email.com',
      phone: '11999999999',
      password: '123456',
      confirmpassword: '123'
    });
    expect(res.status).toBe(422);
    expect(res.body.message).toBe('As senhas não conferem!');
  });

  test('4. Registrar usuário - erro email duplicado', async () => {
    const res = await request(app).post('/api/users/register').send({
      name: 'Outro',
      email: 'joao@teste.com',
      phone: '11888888888',
      password: '123456',
      confirmpassword: '123456'
    });
    expect(res.status).toBe(422);
    expect(res.body.message).toBe('E-mail já cadastrado!');
  });

  test('5. Login com sucesso', async () => {
    const res = await request(app).post('/api/users/login').send({
      email: 'joao@teste.com',
      password: '123456'
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('6. Login - erro sem email', async () => {
    const res = await request(app).post('/api/users/login').send({
      password: '123456'
    });
    expect(res.status).toBe(422);
    expect(res.body.message).toBe('O e-mail é obrigatório!');
  });

  test('7. Login - erro senha incorreta', async () => {
    const res = await request(app).post('/api/users/login').send({
      email: 'joao@teste.com',
      password: 'senhaerrada'
    });
    expect(res.status).toBe(422);
    expect(res.body.message).toBe('Senha inválida!');
  });

  test('8. Buscar usuário por ID com sucesso', async () => {
    const res = await request(app).get(`/api/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('João Silva');
  });

  test('9. Buscar usuário - ID não encontrado', async () => {
    const res = await request(app).get('/api/users/999');
    expect(res.status).toBe(422);
    expect(res.body.message).toBe('Usuário não encontrado!');
  });

  test('10. Atualizar usuário com sucesso', async () => {
    const res = await request(app).put(`/api/users/edit/${userId}`).send({
      name: 'João Silva Atualizado',
      phone: '11888888888'
    });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('João Silva Atualizado');
  });
});