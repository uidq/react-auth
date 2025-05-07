import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, Logo } from "@/components/icons";

export const Navbar = () => {
  return (
    <HeroUINavbar 
      maxWidth="xl" 
      position="sticky" 
      className="bg-[#18181b] border-b border-subtle-border bg-opacity-95 backdrop-blur-md z-50"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-2" href="/">
            <Logo />
            <p className="font-bold text-inherit text-primary">Auth<span className="text-white">Base</span></p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-6 justify-start ml-8">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  "text-text-secondary hover:text-white transition-colors duration-200",
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden md:flex">
          <NextLink href="/auth/login">
            <Button
              className="text-sm bg-transparent border border-subtle-border hover:bg-card-hover transition-all duration-200 mr-2"
              variant="flat"
              radius="full"
            >
              Login
            </Button>
          </NextLink>
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          <NextLink href="/auth/register">
            <Button
              className="text-sm bg-primary hover:opacity-90 transition-all duration-200 btn-hover"
              radius="full"
            >
              Register
            </Button>
          </NextLink>
        </NavbarItem>
        <NavbarItem className="hidden sm:flex">
          <Link 
            isExternal 
            aria-label="Github" 
            href={siteConfig.links.github}
            className="p-2 rounded-full hover:bg-card-hover transition-all duration-200"
          >
            <GithubIcon className="text-white" />
          </Link>
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link 
          isExternal 
          aria-label="Github" 
          href={siteConfig.links.github}
          className="p-2 rounded-full hover:bg-card-hover transition-all duration-200"
        >
          <GithubIcon className="text-white" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu className="bg-background bg-opacity-95 backdrop-blur-md pt-8">
        <div className="mx-4 mt-2 flex flex-col gap-4">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color="foreground"
                href={item.href}
                size="lg"
                className="hover:text-primary transition-colors duration-200"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          <div className="flex flex-col gap-2 mt-4">
            <NextLink href="/auth/login">
              <Button
                className="w-full bg-transparent border border-subtle-border hover:bg-card-hover transition-all duration-200"
                variant="flat"
                radius="full"
              >
                Login
              </Button>
            </NextLink>
            <NextLink href="/auth/register">
              <Button
                className="w-full bg-primary hover:opacity-90 transition-all duration-200"
                radius="full"
              >
                Register
              </Button>
            </NextLink>
          </div>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
