/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { toast } from 'sonner';
import { useBookingsStore } from '@/hooks/overview/useBookings';
import { Booking } from '@/types/booking';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/ui/data-table';
import { columns } from '@/app/(dashboard)/overview/columns';

const statusOptions = [
	'pending',
	'confirmed',
	'checked-in',
	'completed',
	'canceled',
	'refund',
	'rescheduled',
];

const getStatusColor = (status: string) => {
	const colors = {
		'pending': 'bg-yellow-100 text-yellow-800',
		'confirmed': 'bg-blue-100 text-blue-800',
		'checked-in': 'bg-green-100 text-green-800',
		'completed': 'bg-purple-100 text-purple-800',
		'canceled': 'bg-red-100 text-red-800',
		'refund': 'bg-orange-100 text-orange-800',
		'rescheduled': 'bg-indigo-100 text-indigo-800',
	};
	return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

interface DialogProps {
	booking: Booking;
	children: React.ReactNode;
	type: 'checkin' | 'modify' | 'cancel';
}

function ResponsiveDialog({ booking, children, type }: DialogProps) {
	const [open, setOpen] = useState(false);
	const isDesktop = useMediaQuery('(min-width: 768px)');
	const [status, setStatus] = useState(booking.status);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { updateBooking, checkInBooking } = useBookingsStore();

	const handleAction = async () => {
		setIsSubmitting(true);
		try {
			switch (type) {
				case 'checkin':
					if (booking.status !== 'confirmed') {
						toast.error('Only confirmed bookings can be checked in');
						return;
					}
					await checkInBooking(booking.id);
					break;
				case 'modify':
					await updateBooking(booking.id, { status });
					break;
				case 'cancel':
					await updateBooking(booking.id, { status: 'canceled' });
					break;
			}
			setOpen(false);
		} catch (error) {
			console.error('Error handling action:', error);
			// Type assertion for the error response structure
			const err = error as {
				response?: {
					data?: {
						error?: {
							description?: string;
						};
						message?: string;
					};
				};
			};
			const errorDescription = err.response?.data?.error?.description;
			const errorMessage =
				errorDescription || err.response?.data?.message || 'An error occurred';
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Helper function to get dialog content based on type and booking status
	const getDialogContent = () => {
		if (type === 'checkin' && booking.status !== 'confirmed') {
			return {
				title: 'Cannot Check-in Guest',
				description:
					'This booking must be in confirmed status before check-in.',
				buttonText: 'Close',
				showAction: false,
			};
		}

		return {
			title:
				type === 'checkin'
					? 'Check-in Guest'
					: type === 'modify'
					? 'Modify Booking'
					: 'Cancel Booking',
			description:
				type === 'checkin'
					? `Are you sure you want to check in ${booking.guest.name}?`
					: type === 'modify'
					? 'Update the booking details below.'
					: `Are you sure you want to cancel booking ${booking.id}?`,
			buttonText:
				type === 'checkin'
					? 'Check In'
					: type === 'modify'
					? 'Save Changes'
					: 'Cancel Booking',
			showAction: true,
		};
	};

	const dialogContent = getDialogContent();

	if (isDesktop) {
		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>{children}</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{dialogContent.title}</DialogTitle>
						<DialogDescription>{dialogContent.description}</DialogDescription>
					</DialogHeader>
					{type === 'modify' && (
						<div className='gap-4 grid py-4'>
							<div className='gap-2 grid'>
								<div>
									<p className='mb-2 font-medium'>Booking Details</p>
									<p>Guest: {booking.guest.name}</p>
									<p>Phone: {booking.guest.phone}</p>
									<p>
										Tent: {booking.detail_booking[0]?.reservation.tent.name} (
										{booking.detail_booking[0]?.reservation.tent.category.name})
									</p>
									<p>
										Dates: {new Date(booking.start_date).toLocaleDateString()} -{' '}
										{new Date(booking.end_date).toLocaleDateString()}
									</p>
									<p>
										Total Amount: Rp.
										{booking.total_amount.toLocaleString('id-ID')}
									</p>
								</div>
								<div className='space-y-2'>
									<label className='font-medium text-sm'>Status</label>
									<Select value={status} onValueChange={setStatus}>
										<SelectTrigger>
											<SelectValue placeholder='Select status' />
										</SelectTrigger>
										<SelectContent>
											{statusOptions.map((option) => (
												<SelectItem key={option} value={option}>
													{option.charAt(0).toUpperCase() + option.slice(1)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setOpen(false)}
							disabled={isSubmitting}
						>
							{dialogContent.showAction ? 'Cancel' : 'Close'}
						</Button>
						{dialogContent.showAction && (
							<Button
								variant={type === 'cancel' ? 'destructive' : 'default'}
								onClick={handleAction}
								disabled={isSubmitting}
							>
								{isSubmitting && (
									<svg
										className='mr-2 w-4 h-4 animate-spin'
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
									>
										<circle
											className='opacity-25'
											cx='12'
											cy='12'
											r='10'
											stroke='currentColor'
											strokeWidth='4'
										></circle>
										<path
											className='opacity-75'
											fill='currentColor'
											d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
										></path>
									</svg>
								)}
								{dialogContent.buttonText}
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>{children}</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>{dialogContent.title}</DrawerTitle>
					<DrawerDescription>{dialogContent.description}</DrawerDescription>
				</DrawerHeader>
				{type === 'modify' && (
					<div className='gap-4 grid p-4'>
						<div className='gap-2 grid'>
							<div>
								<p className='mb-2 font-medium'>Booking Details</p>
								<p>Guest: {booking.guest.name}</p>
								<p>Phone: {booking.guest.phone}</p>
								<p>
									Tent: {booking.detail_booking[0]?.reservation.tent.name} (
									{booking.detail_booking[0]?.reservation.tent.category.name})
								</p>
								<p>
									Dates: {new Date(booking.start_date).toLocaleDateString()} -{' '}
									{new Date(booking.end_date).toLocaleDateString()}
								</p>
								<p>
									Total Amount: Rp.
									{booking.total_amount.toLocaleString('id-ID')}
								</p>
							</div>
							<div className='space-y-2'>
								<label className='font-medium text-sm'>Status</label>
								<Select value={status} onValueChange={setStatus}>
									<SelectTrigger>
										<SelectValue placeholder='Select status' />
									</SelectTrigger>
									<SelectContent>
										{statusOptions.map((option) => (
											<SelectItem key={option} value={option}>
												{option.charAt(0).toUpperCase() + option.slice(1)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				)}
				<DrawerFooter>
					{dialogContent.showAction ? (
						<>
							<Button
								variant={type === 'cancel' ? 'destructive' : 'default'}
								onClick={handleAction}
								disabled={isSubmitting}
							>
								{isSubmitting && (
									<svg
										className='mr-2 w-4 h-4 animate-spin'
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
									>
										<circle
											className='opacity-25'
											cx='12'
											cy='12'
											r='10'
											stroke='currentColor'
											strokeWidth='4'
										></circle>
										<path
											className='opacity-75'
											fill='currentColor'
											d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
										></path>
									</svg>
								)}
								{dialogContent.buttonText}
							</Button>
							<Button
								variant='outline'
								onClick={() => setOpen(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
						</>
					) : (
						<Button variant='outline' onClick={() => setOpen(false)}>
							Close
						</Button>
					)}
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

// Loading skeleton for the booking list
function BookingListSkeleton() {
	return (
		<div>
			<div className='flex justify-end mb-4'>
				<Skeleton className='w-32 h-10' />
			</div>
			<div className='border rounded-md'>
				<div className='p-4'>
					<div className='space-y-3'>
						<Skeleton className='w-full h-10' />
						<Skeleton className='w-full h-32' />
					</div>
				</div>
			</div>
		</div>
	);
}

export function BookingList() {
	const { getBookings, bookings, isLoading } = useBookingsStore();
	const initialFetchDone = useRef(false);

	// Fetch bookings when component mounts
	useEffect(() => {
		if (!initialFetchDone.current) {
			console.log('Initial bookings list mount - fetching data');
			initialFetchDone.current = true;
			getBookings();
		}
	}, [getBookings]);

	const handleExport = () => {
		toast.success('Data exported successfully');
	};

	// Show loading state
	if (isLoading) {
		return <BookingListSkeleton />;
	}

	return (
		<div>
			<div className='flex justify-end mb-4'>
				<Button onClick={handleExport} variant='outline'>
					<Download className='mr-2 w-4 h-4' />
					Export Data
				</Button>
			</div>
			<DataTable columns={columns} data={bookings} />
		</div>
	);
}
