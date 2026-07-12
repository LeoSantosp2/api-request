import { Router } from 'express';

import usersController from '../controllers/users-controller';

import { loginRequired } from '../middleware/login-required';
import { validateBody } from '../middleware/validate-body';

import { userRequestSchema } from '../interfaces/users-schema';

const router = Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Retorna Todos os Usuários
 *     description: Busca e retorna a lista completa de usuários cadastrados. Requer autenticação.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: eddcdbb6-0294-4f0e-959c-fea84cd687c4
 *                   first_name:
 *                     type: string
 *                     example: João
 *                   last_name:
 *                     type: string
 *                     example: Silva
 *                   email:
 *                     type: string
 *                     example: joao@email.com
 *                   created_at:
 *                     type: string
 *                     example: 2026-02-16
 *                   updated_at:
 *                     type: string
 *                     example: 2026-02-16
 *       401:
 *         description: Autenticação obrigatória
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/users', loginRequired, usersController.listAll);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Retorna um Usuário
 *     description: Busca e retorna um usuário. Requer autenticação.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Usuário retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: eddcdbb6-0294-4f0e-959c-fea84cd687c4
 *                 first_name:
 *                   type: string
 *                   example: João
 *                 last_name:
 *                   type: string
 *                   example: Silva
 *                 email:
 *                   type: string
 *                   example: joao@email.com
 *                 created_at:
 *                   type: string
 *                   example: 2026-02-16
 *                 updated_at:
 *                   type: string
 *                   example: 2026-02-16
 *       401:
 *         description: Autenticação obrigatória
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/users/:id', loginRequired, usersController.listOne);

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Cria um Novo Usuário
 *     description: Cria e registra um novo usuário no sistema.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: João
 *               lastName:
 *                 type: string
 *                 example: Silva
 *               email:
 *                 type: string
 *                 example: joao@email.com
 *               password:
 *                 type: string
 *                 example: SenhaForte@123
 *               confirmPassword:
 *                 type: string
 *                 example: SenhaForte@123
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos ou email já cadastrado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/users', validateBody(userRequestSchema), usersController.create);

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Atualiza um Usuário
 *     description: Atualiza os dados de um usuário existente. Requer autenticação.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: eddcdbb6-0294-4f0e-959c-fea84cd687c4
 *         description: ID do usuário a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: José
 *               lastName:
 *                 type: string
 *                 example: Santos
 *               email:
 *                 type: string
 *                 example: jose@email.com
 *               password:
 *                 type: string
 *                 example: NovaSenha@123
 *               confirmPassword:
 *                 type: string
 *                 example: NovaSenha@123
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: Dados inválidos ou email já cadastrado
 *       401:
 *         description: Autenticação obrigatória
 *       403:
 *         description: Sem permissão para alterar este usuário
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put(
  '/users/:id',
  loginRequired,
  validateBody(userRequestSchema),
  usersController.updateUser,
);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Deleta um Usuário
 *     description: Remove um usuário do sistema. Requer autenticação.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: eddcdbb6-0294-4f0e-959c-fea84cd687c4
 *         description: ID do usuário a ser deletado
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso
 *       401:
 *         description: Autenticação obrigatória
 *       403:
 *         description: Sem permissão para deletar este usuário
 *       404:
 *         description: Usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/users/:id', loginRequired, usersController.deleteUser);

export default router;
