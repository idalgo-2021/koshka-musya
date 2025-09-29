
export const getRoleBadgeVariant = (roleId: number) => {
  switch (roleId) {
    case 1: return 'default' // admin
    case 2: return 'secondary' // moderator
    case 3: return 'outline' // secret_guest
    default: return 'outline'
  }
}

export const getRoleDisplayName = (roleId: number, roleName: string) => {
  switch (roleId) {
    case 1: return 'Администратор'
    case 2: return 'Модератор'
    case 3: return 'Секретный гость'
    default: return roleName
  }
}
