import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../firebase/config'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await sendPasswordResetEmail(auth, email)
      alert('Se envió un correo de restablecimiento de contraseña. Revisa tu bandeja de entrada.')
    } catch (error) {
      console.error('Error enviando correo de restablecimiento:', error)
      alert('Error al enviar correo de restablecimiento: ' + error.message)
    }
  }

  return (
    <>
      <Head>
        <title>Recuperar contraseña | Carpi Hogar</title>
      </Head>
      <div className="min-h-screen w-full bg-[#f7f3ee] flex items-center justify-center px-4 py-12">
        <div className="flex w-full max-w-6xl rounded-2xl overflow-hidden shadow-xl">
          {/* Imagen lateral idéntica a login */}
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
          {/* Formulario de recuperación */}
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Recuperar contraseña</h1>
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg py-2 px-4"
              />
              <button
                type="submit"
                className="w-full bg-yellow-600 hover:bg-yellow-700 transition rounded-lg py-3 text-white font-medium"
              >
                Enviar enlace de restablecimiento
              </button>
            </form>
            <p className="text-sm text-gray-600 mt-6">
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Volver al inicio de sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}