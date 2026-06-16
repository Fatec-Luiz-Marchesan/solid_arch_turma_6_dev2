const User = require('../../models/User');
const bcrypt = require('bcrypt');

class LoginUserUseCase {
  async execute(credentials) {
    const { email, password } = credentials;

    if (!email) return { success: false, message: 'O e-mail é obrigatório!', status: 422 };
    if (!password) return { success: false, message: 'A senha é obrigatória!', status: 422 };

    const user = await User.findOne({ email });
    if (!user) return { success: false, message: 'Usuário não encontrado!', status: 422 };

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) return { success: false, message: 'Senha inválida!', status: 422 };

    return { success: true, user, status: 200 };
  }
}

module.exports = LoginUserUseCase;