

import dynamic from "next/dynamic";
  const Dhdh = dynamic(() => import("@/components/Dhdh"), { ssr: false });

  export default function create() {

  return <>

    <div>
      <Dhdh />
    </div>
  </>
}
  