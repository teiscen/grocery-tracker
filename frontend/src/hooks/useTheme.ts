import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

export function useTheme() {
    // matchMedia(): Query CSS media condition with js\
    // .matches:     gives the result 
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    // Get 'theme' from local storage
    const raw = localStorage.getItem('theme')
    // (Theme|null) stored = if (raw is 'light' or 'dark') then raw else null
    const stored: Theme | null = raw === 'light' || raw === 'dark' ? raw : null

    // An array of the current value, and the func to update it
    // useState(): react hook creating 'piece of state' that when changed causes the 
    //              component to re-render
    const [theme, setTheme] = useState<Theme>(stored ?? (systemDark ? 'dark' : 'light'))
                                                // ?? nullish op. (use left if not null, otherwise use right)
                                                // if systemDark is yes then dark otherwise light (matching the type Theme)
    
    // 1st arg: Function to run, 2nd arg: what values trigger this change
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    // setTheme(): requires a callback function that receives the state and returns a new one
    const toggle = () => setTheme((t) => t === 'dark' ? 'light' : 'dark')

    return { theme, toggle }
}