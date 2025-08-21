import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../firebase/config'
import { doc, setDoc } from 'firebase/firestore'
import { devError } from '../../utils/devLog'

export default function Register() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      await setDoc(doc(db, 'users', user.uid), { nombre, email, rol: 'cliente' })
      alert('Registro completado. Ya puedes iniciar sesión como cliente de la tienda.')
      router.push('/auth/login')
    } catch (error) {
      devError('Error registrando usuario:', error)
      alert('Error al registrarse: ' + error.message)
    }
  }

  return (
    <>
      <Head>
        <title>Registro | Carpi Hogar</title>
      </Head>

      <div className="min-h-screen w-full bg-[#f7f3ee] flex items-center justify-center px-4 py-12">
        <div className="flex w-full max-w-6xl rounded-2xl overflow-hidden shadow-xl">
          <div className="hidden md:flex md:w-1/2 relative">
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center px-6">
              <h2 className="text-white text-3xl font-semibold text-center leading-snug">
                Hogar<br />decoración y carpintería
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
              Regístrate en el sistema
            </h1>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <input
                type="text"
                placeholder="Nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg py-2 px-4"
              />
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
                className="w-full bg-green-600 hover:bg-green-700 transition rounded-lg py-3 text-white font-medium"
              >
                Registrar cuenta
              </button>
            </form>

            <p className="text-sm text-gray-600 mt-6">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}