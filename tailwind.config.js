module.exports = {
	darkMode: 'class', // Atur ke 'class' agar dark mode berdasarkan class (seperti di konfigurasi sebelumnya)
	content: [
	  "./pages/**/*.{js,ts,jsx,tsx}",
	  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
	  extend: {
		screens: {
			'mobile': '320px',
			// => @media (min-width: 320px) { ... }
	  
			'tablet': '640px',
			// => @media (min-width: 640px) { ... }
	  
			'laptop': '1024px',
			// => @media (min-width: 1024px) { ... }
	  
			'desktop': '1280px',
			// => @media (min-width: 1280px) { ... }
			'sm': '640px',
			// => @media (min-width: 640px) { ... }
	  
			'md': '768px',
			// => @media (min-width: 768px) { ... }
	  
			'lg': '1024px',
			// => @media (min-width: 1024px) { ... }
	  
			'xl': '1280px',
			// => @media (min-width: 1280px) { ... }
	  
			'2xl': '1536px',
			// => @media (min-width: 1536px) { ... }
		  },
		colors: {
		  primary: {
			DEFAULT: 'hsl(var(--primary))',
			foreground: 'hsl(var(--primary-foreground))'
		  },
		  secondary: {
			DEFAULT: 'hsl(var(--secondary))',
			foreground: 'hsl(var(--secondary-foreground))'
		  },
		  'primary-dark': '#0275a7',
		  green: '#92e2a8',
		  biru: '#7BB3B4',
		  birumuda: '#CFE9E6',
		  putih: '#ffff',
		  abumuda: '#F3F3F3',
		  deepBlue: '#0B61AA',
		  orange: '#F8B75B',
		  powderBlue: '#78AED6',
		  paleBlue: '#CAE6F9',
		  birutua: '#0B61AA',
		  background: 'hsl(var(--background))',
		  foreground: 'hsl(var(--foreground))',
		  card: {
			DEFAULT: 'hsl(var(--card))',
			foreground: 'hsl(var(--card-foreground))'
		  },
		  popover: {
			DEFAULT: 'hsl(var(--popover))',
			foreground: 'hsl(var(--popover-foreground))'
		  },
		  muted: {
			DEFAULT: 'hsl(var(--muted))',
			foreground: 'hsl(var(--muted-foreground))'
		  },
		  accent: {
			DEFAULT: 'hsl(var(--accent))',
			foreground: 'hsl(var(--accent-foreground))'
		  },
		  destructive: {
			DEFAULT: 'hsl(var(--destructive))',
			foreground: 'hsl(var(--destructive-foreground))'
		  },
		  border: 'hsl(var(--border))',
		  input: 'hsl(var(--input))',
		  ring: 'hsl(var(--ring))',
		  chart: {
			'1': 'hsl(var(--chart-1))',
			'2': 'hsl(var(--chart-2))',
			'3': 'hsl(var(--chart-3))',
			'4': 'hsl(var(--chart-4))',
			'5': 'hsl(var(--chart-5))'
		  }
		},
		animation: {
		  'fade-in': 'fadeIn 0.3s ease-in-out',
		  'slide-in': 'slideIn 0.3s ease-in-out',
		  'pull-down': 'pullDown 0.5s ease-in-out',
		  'click-bounce': 'clickBounce 0.3s ease-in-out'
		},
		keyframes: {
		  fadeIn: {
			'0%': {
			  opacity: '0'
			},
			'100%': {
			  opacity: '1'
			}
		  },
		  slideIn: {
			'0%': {
			  transform: 'translateY(10px)',
			  opacity: '0'
			},
			'100%': {
			  transform: 'translateY(0)',
			  opacity: '1'
			}
		  },
		  clickBounce: {
			'0%, 100%': {
			  transform: 'scale(1)'
			},
			'50%': {
			  transform: 'scale(0.95)'
			},
			'75%': {
			  transform: 'scale(1.05)'
			}
		  },
		  pullDown: {
			'0%': {
			  transform: 'translateY(-20px)'
			},
			'100%': {
			  transform: 'translateY(0)'
			}
		  }
		},
		backgroundImage: {
		  'gradient-custom': 'linear-gradient(to right, #DEF6FF, #0B61AA)'
		},
		boxShadow: {
		  customShadow: '0 40px 40px rgba(0, 0, 0, 0.25)'
		},
		container: {
		  center: true,
		  padding: {
			DEFAULT: '1rem',
			sm: '2rem',
			lg: '4rem',
			xl: '5rem',
			'2xl': '6rem'
		  }
		},
		fontFamily: {
		  poppins: ["Poppins", "sans-serif"],
		  bodoni: ['Libre Bodoni', "serif"]
		},
		borderRadius: {
		  lg: 'var(--radius)',
		  md: 'calc(var(--radius) - 2px)',
		  sm: 'calc(var(--radius) - 4px)'
		}
	  }
	},
	plugins: [require("tailwindcss-animate")]
  }
  