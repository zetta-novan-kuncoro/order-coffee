import { Component, OnDestroy, computed, effect, signal } from '@angular/core'

type Message = {
  msg: string
  icon: '✅'
}

type Item = {
  id: string
  name: string
  price: number
}

type CartItem = Item & {
  amount: number
}

type Profile = {
  name: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy {
  profile = signal<Profile | null>(this.getLocalStorageProfile())
  menu = signal<Item[]>([
    {
      id: '1',
      name: 'Latte',
      price: 15000,
    },
    {
      id: '2',
      name: 'Cappucino',
      price: 15000,
    },
    {
      id: '3',
      name: 'Espresso',
      price: 15000,
    },
    {
      id: '4',
      name: 'On The Rock',
      price: 15000,
    },
  ])
  messages = signal<Message[]>([])
  cart = signal<CartItem[]>(this.getLocalStorageCart())
  total = computed(() => {
    return this.cart().reduce(
      (accumulator, current) => accumulator + current.amount * current.price,
      0
    )
  })

  saveCartToLocalStorageEffect = effect(() => {
    localStorage.setItem('cart', JSON.stringify(this.cart()))
  })

  getLocalStorageProfile(): Profile | null {
    try {
      const profile = JSON.parse(localStorage.getItem('profile') || '')
      if (profile?.name) {
        return profile
      }
      return null
    } catch(error) {
      return null
    }
  }

  getLocalStorageCart(): CartItem[] {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '')
      if (Array.isArray(cart)) {
        return cart
      }
      return []
    } catch(error) {
      return []
    }
  }

  ngOnDestroy(): void {
    this.saveCartToLocalStorageEffect.destroy()
  }

  login(name: string, pw: string) {
    if (!name || !pw) return
    this.profile.set({
      name,
    })
  }

  logout() {
    this.profile.set(null)
  }

  addToCart(item: Item) {
    this.cart.mutate((cart) => {
      const existingItemIdx = cart.findIndex(
        (cartItem: CartItem) => cartItem.id === item.id
      )
      if (existingItemIdx > -1) {
        cart[existingItemIdx].amount += 1
      } else {
        cart.push({
          ...item,
          amount: 1,
        })
      }
    })
  }

  removeItemFromCart(item: Item) {
    this.cart.update((cart) => {
      const existingItemIdx = cart.findIndex(
        (cartItem: CartItem) => cartItem.id === item.id
      )
      if (existingItemIdx > -1) {
        cart[existingItemIdx].amount -= 1
      }

      if (cart[existingItemIdx].amount < 1) {
        cart.splice(existingItemIdx, 1)
      }
      return cart
    })
  }

  checkout() {
    this.cart.set([])
    this.messages.mutate((messages) => {
      messages.push({ msg: 'Items Purchased', icon: '✅' })
    })
    const timeout = setTimeout(() => {
      this.messages.set([])
      clearTimeout(timeout)
    }, 2000)
  }
}
