import { useMemo, useState } from "react";
import { Download, Plus, RotateCcw, Search } from "lucide-react";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import PageHeader from "../../components/common/PageHeader";

const subjects = [
  ["SUB-HK-001","HiGOOD 香港公司","HiGOOD HK","采购主体 / 销售主体","中国香港","香港","陈经理","+852 **** 6688","是","是","当前主要贸易主体","2026-08-06 10:20","系统管理员"],
  ["SUB-ID-PTCM","PT CM","PT CM","印尼主体 / 销售对象","印度尼西亚","雅加达","Agus","+62 **** 1028","是","是","可作为销售对象","2026-08-05 16:30","财务管理员"],
  ["SUB-ID-GOTO","GOTO","GOTO","印尼主体 / 销售对象","印度尼西亚","雅加达","Budi","+62 **** 2036","是","是","可作为销售对象","2026-08-05 15:10","财务管理员"],
  ["SUB-ID-FADFAD","FADFAD","FADFAD","供应链平台 / 销售对象","印度尼西亚","万隆","Rina","+62 **** 6681","是","是","FADFAD 就是供应链平台","2026-08-05 14:00","系统管理员"],
  ["SUB-FAC-001","印尼车缝工厂 A","Factory A","三方工厂 / 销售对象","印度尼西亚","万隆","Dedi","+62 **** 8852","是","否","可作为销售对象","2026-08-04 11:25","采购主管"],
  ["SUB-CN-001","广州华盛面料有限公司","华盛面料","国内供应商","中国大陆","广州","李经理","138****8899","是","是","面料供应商","2026-08-03 16:30","王采购"],
  ["SUB-CLEAR-001","雅加达清关服务商","JKT Customs","清关主体","印度尼西亚","雅加达","Andi","+62 **** 3099","是","否","清关服务主体","2026-08-02 09:40","物流主管"],
];

export default function TradeSubjectManagement(){
  const [keyword,setKeyword]=useState("");
  const rows=useMemo(()=>subjects.filter(row=>!keyword||row.join(" ").toLowerCase().includes(keyword.toLowerCase())),[keyword]);
  return <div><PageHeader title="贸易主体管理" desc="统一维护香港公司、印尼主体、国内供应商、物流商、清关主体、开票主体及所有可选销售对象。" />
    <section className="mb-3 rounded border bg-white p-3"><div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6"><input className="h-8 rounded border px-2 text-sm" placeholder="主体名称 / 主体编码" value={keyword} onChange={e=>setKeyword(e.target.value)}/>{["主体类型","国家 / 地区","是否启用","是否常用主体"].map(x=><select key={x} className="h-8 rounded border px-2 text-sm"><option>{x}</option><option>全部</option></select>)}</div><div className="mt-3 flex gap-2"><button className="inline-flex h-8 items-center gap-1 rounded bg-blue-600 px-3 text-sm text-white"><Search size={14}/>查询</button><button className="inline-flex h-8 items-center gap-1 rounded border px-3 text-sm" onClick={()=>setKeyword("")}><RotateCcw size={14}/>重置</button><button className="inline-flex h-8 items-center gap-1 rounded bg-emerald-600 px-3 text-sm text-white"><Plus size={14}/>新增主体</button><button className="inline-flex h-8 items-center gap-1 rounded border px-3 text-sm"><Download size={14}/>导出</button></div></section>
    <section className="overflow-x-auto border bg-white"><table className="min-w-[1900px] text-left text-xs"><thead className="bg-gray-50"><tr>{["主体编码","主体名称","主体简称","主体类型","国家 / 地区","城市","联系人","联系电话","是否启用","是否常用主体","备注","更新时间","最后操作人","操作"].map(x=><th key={x} className="border-b px-3 py-2 font-medium">{x}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row[0]} className="border-b hover:bg-blue-50/30">{row.map((cell,i)=><td key={i} className={`whitespace-nowrap px-3 py-3 ${i===0?'font-medium text-blue-600':''}`}>{i===8||i===9?<span className={`rounded-full px-2 py-1 ${cell==='是'?'bg-emerald-50 text-emerald-700':'bg-gray-100 text-gray-600'}`}>{cell}</span>:cell}</td>)}<td className="whitespace-nowrap px-3 py-3"><button className="mr-3 text-blue-600">查看</button><button className="mr-3 text-blue-600">编辑</button><button className="mr-3 text-amber-600">启用 / 停用</button><button className="text-gray-600">操作日志</button></td></tr>)}</tbody></table></section>
    <DesignLogicCard sections={[{title:"页面功能说明",headers:["说明"],rows:[["贸易主体管理用于统一维护 PMS 中涉及的各类经营主体。系统不做固定贸易链路配置，销售对象直接在采购单中从贸易主体中选择。FADFAD 即供应链平台，系统中只维护一个主体，避免重复主体导致经营明细和对账数据混乱。"]]},{title:"业务逻辑说明",headers:["业务场景","规则说明","页面结果"],rows:[["主体统一维护","香港公司、PT CM、GOTO、FADFAD、三方工厂统一维护","采购单可直接选择销售对象"],["FADFAD","FADFAD 就是供应链平台","不重复创建供应链平台和 FADFAD"],["三方工厂","三方工厂需要作为销售对象","采购单销售对象可选择三方工厂"],["主体启停","停用主体不再出现在新单据下拉中","历史数据保留"],["不做链路配置","业务销售对象不固定","不通过固定链路限制销售对象"]]}]} />
  </div>;
}
