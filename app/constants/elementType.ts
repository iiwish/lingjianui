// 菜单类型到路由类型的映射(id -> code)
export const menuTypeToRouteType: { [key: string]: string } = {
  "1": "folder",
  "2": "table",
  "3": "dim",
  "4": "menu", 
  "5": "model",
  "6": "form"
};

// 路由类型到菜单类型的映射(code -> id)
export const routeTypeToMenuType: { [key: string]: string } = {
    "folder": "1",
  "table": "2",
  "dim": "3",
  "menu": "4",
  "model": "5", 
  "form": "6"
};
