'use client'
 /* Boton de contador para probar el componente y aplicarlo en otra pagina*/ 
import { useState } from 'react'
 
export default function Contador() {
  const [count, setCount] = useState(0)
 
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}