const User = require('../../models/User');
const bcrypt = require('bcrypt');
const createUserToken = require('../../helpers/create-user-token');

class RegisterUserUseCase {
  async execute(userData) {
    const { name, email, phone, password, confirmpassword } = userData;

    if (!name) return { success: false, message: 'O nome é obrigatório!', status: 422 };
    if (!email) return { success: false, message: 'O e-mail é obrigatório!', status: 422 };
    if (!phone) return { success: false, message: 'O telefone é obrigatório!', status: 422 };
    if (!password) return { success: false, message: 'A senha é obrigatória!', status: 422 };
    if (!confirmpassword) return { success: false, message: 'A confirmação de senha é obrigatória!', status: 422 };
    if (password !== confirmpassword) return { success: false, message: 'As senhas não conferem!', status: 422 };

    const userExists = await User.findOne({ email });
    if (userExists) return { success: false, message: 'E-mail já cadastrado!', status: 422 };

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ name, email, phone, password: passwordHash });
    const newUser = await user.save();

    return { success: true, user: newUser, status: 201 };
  }
}

module.exports = RegisterUserUseCase;