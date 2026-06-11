import SimpleTablePage from "../SimpleTablePage";
import { users } from "../../mock/users";
export default function UserManagement() { return <SimpleTablePage title="用户管理" desc="系统用户维护。" rows={users} columns={[{ key: "username", title: "用户名" }, { key: "name", title: "姓名" }, { key: "role", title: "角色" }, { key: "dept", title: "部门" }, { key: "status", title: "状态" }]} />; }
