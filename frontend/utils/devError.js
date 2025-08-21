export function devError(...args) {
  if (process.env.NODE_ENV !== 'production') {
    console.error(...args)
  }
}

