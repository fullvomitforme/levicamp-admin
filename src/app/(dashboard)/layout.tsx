'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/contexts/sidebar-context';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
	SidebarInset,
	SidebarProvider as UISidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar';
import { Toaster } from 'sonner';
import { usePathname } from 'next/navigation';
import React from 'react';
import {
	CalendarFold,
	LucideHome,
	PieChartIcon,
	SettingsIcon,
	Users,
} from 'lucide-react';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const NavigationItem = [
	{
		title: 'Overview',
		url: '/overview',
		icon: PieChartIcon,
		isActive: true,
	},
	{
		title: 'Reservation Management',
		url: '/reservation-management',
		icon: CalendarFold,
	},
	{
		title: 'Tent Management',
		url: '#',
		icon: LucideHome,
		items: [
			{
				title: 'Tent Categories',
				url: '/tent-management/tent-categories',
			},
			{
				title: 'Tents',
				url: '/tent-management/tents',
			},
		],
	},
	{
		title: 'Admin Management',
		url: '/admin-management',
		icon: Users,
	},
];

const user = {
	name: 'shadcn',
	email: 'tazkiyadigitalarchive@gmail.com',
	avatar: '/avatars/shadcn.jpg',
};

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	// Create breadcrumb segments from pathname
	const pathSegments = pathname.split('/').filter(Boolean);

	// Generate breadcrumb items with proper paths
	const breadcrumbItems = pathSegments.map((segment, index) => {
		const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
		const name =
			segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
		return { name, href };
	});

	return (
		<SidebarProvider items={NavigationItem}>
			<UISidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<header className='group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 flex justify-between items-center gap-2 shadow-sm w-full h-16 transition-[width,height] ease-linear shrink-0'>
						<div className='flex items-center gap-2 px-4'>
							<SidebarTrigger className='-ml-1' />
							<Separator orientation='vertical' className='mr-2 h-4' />
							<Breadcrumb>
								<BreadcrumbList>
									{breadcrumbItems.map((item, index) => (
										<React.Fragment key={item.href}>
											{index > 0 && (
												<BreadcrumbSeparator className='hidden md:block' />
											)}
											<BreadcrumbItem className='hidden md:block'>
												{index === 0 || index === breadcrumbItems.length - 1 ? (
													<BreadcrumbPage>{item.name}</BreadcrumbPage>
												) : (
													<BreadcrumbLink href={item.href}>
														{item.name}
													</BreadcrumbLink>
												)}
											</BreadcrumbItem>
										</React.Fragment>
									))}
								</BreadcrumbList>
							</Breadcrumb>
						</div>
						<div className='flex justify-between items-center gap-2 px-4'>
							<Link href='/settings'>
								<Button variant={'ghost'} size={'icon'}>
									<SettingsIcon />
								</Button>
							</Link>
							<Separator orientation='vertical' className='mr-2 h-4' />
							<NavUser user={user} />
						</div>
					</header>
					<div className='flex flex-col flex-1 gap-4 p-4 pt-0'>
						<Toaster richColors position='top-right' />
						{children}
					</div>
				</SidebarInset>
			</UISidebarProvider>
		</SidebarProvider>
	);
}
