import { Router } from 'express';

import loginController from '../controllers/login-controller';

const router = Router();

/**
 * @openapi
 * /api/login:
 *   post:
 *     summary: Realiza Login do Usuário
 *     description: Autentica um usuário com email e senha, retornando um token JWT válido por 7 dias.
 *     tags:
 *       - Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: joao@email.com
 *               password:
 *                 type: string
 *                 example: SenhaForte@123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: eddcdbb6-0294-4f0e-959c-fea84cd687c4
 *                 email:
 *                   type: string
 *                   example: joao@email.com
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImVkZGNkYmI2LTAyOTQtNGYwZS05NTljLWZlYTg0Y2Q2ODdjNCIsImVtYWlsIjoiam9hb0BlbWFpbC5jb20iLCJpYXQiOjE3Mzk3MzcwMDAsImV4cCI6MTc0MDM0MTgwMH0.abcd1234...
 *       400:
 *         description: E-mail inválido ou senha inválida
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/login', loginController.loginUser);

export default router;
