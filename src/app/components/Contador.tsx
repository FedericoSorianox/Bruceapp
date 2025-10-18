'use client'
 /* Boton de contador para probar el componente y aplicarlo en otra pagina*/ 
import { useState } from 'react'
 
export default function Contador() {
  const [count, setCount] = useState(0)
 
  return (
    <div data-testid="contador-component">
      <p data-testid="contador-count">Count: {count}</p>
      <button data-testid="contador-increment-button" onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}