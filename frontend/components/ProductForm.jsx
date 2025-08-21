import { useState, useEffect } from 'react'
import { db, storage } from '../firebase/config'
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

export default function ProductForm({ onClose, productToEdit }) {
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState('')
  const [stock, setStock] = useState('')
  const [stockMinimo, setStockMinimo] = useState('')
  const [marca, setMarca] = useState('')
  const [proveedor, setProveedor] = useState('')
  const [imagenes, setImagenes] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])

  useEffect(() => {
    setSelectedFiles([])
    if (productToEdit) {
      setNombre(productToEdit.nombre ?? '')
      setPrecio(
        productToEdit.precio !== undefined && productToEdit.precio !== null
          ? productToEdit.precio.toString()
          : ''
      )
      setDescripcion(productToEdit.descripcion ?? '')
      setCategoria(productToEdit.categoria ?? '')
      setCodigo(productToEdit.codigo ?? productToEdit.id ?? '')
      setStock(
        productToEdit.stock !== undefined && productToEdit.stock !== null
          ? productToEdit.stock.toString()
          : ''
      )
      setStockMinimo(
        productToEdit.stock_minimo !== undefined &&
        productToEdit.stock_minimo !== null
          ? productToEdit.stock_minimo.toString()
          : ''
      )
      setMarca(productToEdit.marca ?? '')
      setProveedor(productToEdit.proveedor ?? '')
      setImagenes(productToEdit.imagenes ?? [])
    } else {
      setNombre('')
      setPrecio('')
      setDescripcion('')
      setCategoria('')
      setCodigo('')
      setStock('')
      setStockMinimo('')
      setMarca('')
      setProveedor('')
      setImagenes([])
    }
  }, [productToEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('ProductForm handleSubmit called', { codigo, nombre, precio, descripcion, categoria, stock, marca, proveedor })
    try {
      // Parse numeric fields before sending to Firestore
      const precioNumber = parseFloat(precio)
      const stockNumber = parseInt(stock, 10)
      const stockMinimoNumber = parseInt(stockMinimo, 10)

      let imagenesUrls = [...imagenes]

      if (selectedFiles.length > 0) {
        const uploadFileWithRetry = async (file, retries = 3) => {
          const filePath = `products/${Date.now()}_${file.name}`
          for (let attempt = 1; attempt <= retries; attempt++) {
            const storageRef = ref(storage, filePath)
            try {
              const uploadTask = uploadBytesResumable(storageRef, file)
              await new Promise((resolve, reject) => {
                uploadTask.on('state_changed', null, reject, resolve)
              })
              return await getDownloadURL(storageRef)
            } catch (error) {
              if (
                error.code === 'storage/retry-limit-exceeded' &&
                attempt < retries
              ) {
                console.warn(
                  `Reintentando subida de ${file.name}, intento ${attempt + 1}`
                )
                await new Promise((r) => setTimeout(r, 1000))
                continue
              }
              throw error
            }
          }
        }

        const uploadPromises = selectedFiles.map(async (file) => {
          try {
            return await uploadFileWithRetry(file)
          } catch (err) {
            console.error('Error subiendo imagen tras varios intentos:', err)
            alert(
              'Error subiendo la imagen después de varios intentos: ' + err.message
            )
            return null
          }
        })
        const uploaded = await Promise.all(uploadPromises)
        const newUrls = uploaded.filter((url) => url)
        imagenesUrls = [...imagenesUrls, ...newUrls]
      }

      const data = {
        codigo,
        nombre,
        precio: precioNumber,
        descripcion,
        categoria,
        stock: stockNumber,
        stock_minimo: stockMinimoNumber,
        marca,
        proveedor,
        imagenes: imagenesUrls,
      }
      if (productToEdit) {
        await updateDoc(doc(db, 'products', productToEdit.id), data)
      } else {
        await addDoc(collection(db, 'products'), data)
      }
      alert('Producto guardado correctamente')
      onClose()
    } catch (error) {
      console.error('Error guardando producto:', error)
      alert('Error al guardar el producto: ' + error.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">
          {productToEdit ? 'Editar Producto' : 'Nuevo Producto'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Código</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Precio</label>
            <input
              type="number"
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Descripción</label>
            <textarea
              rows="3"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Categoría</label>
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Marca</label>
            <input
              type="text"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Proveedor</label>
            <input
              type="text"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Stock</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Stock Mínimo</label>
            <input
              type="number"
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Imágenes (máximo 3)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files)
                if (files.length + imagenes.length > 3) {
                  alert(`Solo puedes seleccionar hasta ${3 - imagenes.length} imágenes adicionales`)
                  return
                }
                setSelectedFiles(files)
              }}
              className="w-full"
            />
            {imagenes.length > 0 && (
              <div className="mt-2 flex space-x-2 overflow-x-auto">
                {imagenes.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Imagen ${idx + 1}`}
                    className="h-16 w-16 object-cover rounded"
                  />
                ))}
              </div>
            )}
            {selectedFiles.length > 0 && (
              <div className="mt-2 flex space-x-2 overflow-x-auto">
                {selectedFiles.map((file, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(file)}
                    alt={`Nueva imagen ${idx + 1}`}
                    className="h-16 w-16 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded hover:opacity-75"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}