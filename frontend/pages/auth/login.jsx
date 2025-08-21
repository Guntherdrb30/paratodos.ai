import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import Link from 'next/link'
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth'
import { auth, provider } from '../../firebase/config'
import { useRouter } from 'next/router'
import { FcGoogle } from 'react-icons/fc'
import { redirectByRole } from '../../utils/redirectByRole'
import { getUserRole } from '../../utils/getUserRole'
import { useNotification } from '../../components/Notification'
import { devError } from '../../utils/devError'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const notify = useNotification()

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      console.log("Usuario autenticado:", user)
      // Obtiene el rol del usuario y redirige según corresponda
      const role = await getUserRole(user.uid)
      redirectByRole(router, role)
    } catch (error) {
      devError('Error al iniciar sesión con Google:', error)
      notify('Error al iniciar sesión con Google: ' + error.message, 'error')
    }
  }
  const handleEmailLogin = async (e) => {
    e.preventDefault()
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const user = result.user
      console.log('Usuario autenticado:', user)
      // Obtiene el rol del usuario y redirige según corresponda
      const role = await getUserRole(user.uid)
      redirectByRole(router, role)
    } catch (error) {
      devError('Error al iniciar sesión con correo:', error)
      notify('Error al iniciar sesión: ' + error.message, 'error')
    }
  }

  return (
    <>
      <Head>
        <title>Login | Carpi Hogar</title>
      </Head>

      <div className="min-h-screen w-full bg-[#f7f3ee] flex items-center justify-center px-4 py-12">
        <div className="flex w-full max-w-6xl rounded-2xl overflow-hidden shadow-xl">
          {/* Imagen del lado izquierdo */}
          <div className="hidden md:flex md:w-1/2 relative">
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center px-6">
              <h2 className="text-white text-3xl font-semibold text-center leading-snug">
                Hogar<br />decoracion y carpinteria
              </h2>
            </div>
            <Image
              src="/images/login-bg.jpg"
              alt="Fondo Carpi Hogar"
              layout="fill"
              objectFit="cover"
              quality={100}
            />
          </div>

          {/* Área de login */}
          <div className="w-full md:w-1/2 bg-white p-10 flex flex-col justify-center items-center text-center">
            <div className="mb-6">
              <Image
                src="/images/logo-carpihogar.jpg"
                width={220}
                height={110}
                alt="Carpi Hogar"
                className="object-contain rounded-md"
              />
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Inicia sesión con tu cuenta
            </h1>

            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center w-full gap-3 bg-gray-100 hover:bg-gray-200 transition rounded-lg py-3 px-6 text-gray-700 font-medium shadow"
            >
              <FcGoogle className="text-2xl" />
              Continuar con Google
            </button>

            <p className="text-sm text-gray-500 mt-6">
              Acceso seguro gestionado por Firebase
            </p>

            <div className="my-4 flex items-center gap-2 w-full">
              <span className="h-px bg-gray-300 flex-1" />
              <span className="text-gray-500">O</span>
              <span className="h-px bg-gray-300 flex-1" />
            </div>
            <form onSubmit={handleEmailLogin} className="w-full flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg py-2 px-4"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg py-2 px-4"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-lg py-3 text-white font-medium"
              >
                Iniciar sesión
              </button>
            </form>

            <p className="text-sm text-gray-600 mt-2">
              <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
            <p className="text-sm text-gray-600 mt-6">
              ¿No tienes cuenta?{' '}
              <Link href="/auth/register" className="text-blue-600 hover:underline">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
