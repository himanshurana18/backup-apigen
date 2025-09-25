import Link from "next/link";
import { IoHomeOutline } from "react-icons/io5";
import { BiLeaf } from "react-icons/bi";
import { MdOutlinePermMedia } from "react-icons/md";
import { SiCodecrafters } from "react-icons/si";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlinePowerSettingsNew } from "react-icons/md";
import { useSession } from "next-auth/react";

export default function Aside() {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <aside>
          <div className="logo">
            <img src="/img/logo.png" alt="Logo" />
          </div>
          <div className="aside_left_nav">
            <Link href="/">
              <IoHomeOutline />
              <span>Home</span>
            </Link>
            <Link href="/manager">
              <BiLeaf />
              <span>Content Manager</span>
            </Link>
            <Link href="/">
              <MdOutlinePermMedia />
              <span>Media Library</span>
            </Link>
            <Link href="/builder">
              <SiCodecrafters />
              <span>Content-Type Builder</span>
            </Link>
            <Link href="/">
              <IoSettingsOutline />
              <span>Settings</span>
            </Link>
          </div>
          <div className="accout_setting_ico_aside">
            <button>
              <MdOutlinePowerSettingsNew />{" "}
            </button>
          </div>
        </aside>
      </>
    );
  }
}
