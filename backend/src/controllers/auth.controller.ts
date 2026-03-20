import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../config/prisma'

//GENERA UN JWT CON EL ID DEL USUARIO
const generateToken = (userId: string): string => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
    )
}

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body

        //VALIDAR QUE LLEGUEN TODOS LOS CAMPOS
        if (!name || !email || !password) {
            res.status(400).json({ message: 'Todos los campos son requeridos' })
            return; 
        }

        //VERIFICAR QUE EL EMAIL EXISTA
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })
        if (existingUser) {
            res.status(409).json({ message: 'El email ya está registrado' })
            return; 
        }

        //HASHEAR LA CONTRASEÑA
        const hashedPassword = await bcrypt.hash(password, 10)

        //CREAR EL USUARIO
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        //GENERAR TOKEN
        const token = generateToken(user.id)

        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl
            }
        })
    } catch (e) {
        console.error('Error al registrar:', e)
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

//POST /api/auth/login
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        if(!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son requeridos' })
        }

        //BUSCAR EL USUARIO
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if(!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' })
        }

        //VERIFICAR CONTRASEÑA
        const isValidPassword = await bcrypt.compare(password, user.password)

        if(!isValidPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' })
        }

        const token = generateToken(user.id)

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl
            }
        })
    } catch (e) {
        console.error('Error en el login: ', e)
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}

//GET /api/auth/me
export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: (req as any).userId }
        })
        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' })
            return
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl
        })
    } catch (e) {
        console.error('Error en getMe:', e)
        res.status(500).json({ message: 'Error interno del servidor' })
    }
}