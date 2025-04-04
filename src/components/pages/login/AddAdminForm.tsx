'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAdminStore } from '@/hooks/admin/useAdmin';
import { toast } from 'sonner';

// UI Components
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';

// Define Zod schema for form validation
const adminFormSchema = z.object({
	name: z.string().min(1, { message: 'Name is required' }),
	username: z
		.string()
		.min(3, { message: 'Username must be at least 3 characters' }),
	password: z
		.string()
		.min(6, { message: 'Password must be at least 6 characters' }),
	phone: z.string().min(8, { message: 'Valid phone number is required' }),
	email: z.string().email({ message: 'Invalid email address' }),
});

type AdminFormValues = z.infer<typeof adminFormSchema>;

export function AddAdminForm() {
	const {
		isCreateModalOpen,
		setIsCreateModalOpen,
		isLoading,
		createAdmin,
		setFormData,
	} = useAdminStore();
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Initialize form with Zod validation
	const form = useForm<AdminFormValues>({
		resolver: zodResolver(adminFormSchema),
		defaultValues: {
			name: '',
			username: '',
			password: '',
			phone: '',
			email: '',
		},
	});

	// Update Zustand store when form fields change
	const handleFormChange = (name: string, value: string) => {
		setFormData({ [name]: value });
	};

	// Handle form submission
	const handleCreateAdmin = async (data: AdminFormValues) => {
		setIsSubmitting(true);

		// Update the store with form data
		Object.entries(data).forEach(([key, value]) => {
			setFormData({ [key]: value });
		});

		try {
			const result = await createAdmin();

			if (result && result.message) {
				toast.success(result.message);
				form.reset(); // Reset form hanya kalau API berhasil
				setIsCreateModalOpen(false); // Tutup modal kalau berhasil
			} else {
				toast.error('Failed to create admin. Please try again.');
			}
		} catch (error) {
			const errorMessage =
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(error as any).response?.data?.message || 'Failed to create admin';
			toast.error(errorMessage);
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Add New Admin</DialogTitle>
					<DialogDescription>
						Create a new administrator account. All fields are required.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleCreateAdmin)}
						className='space-y-4'
						autoComplete='off'
					>
						<FormField
							control={form.control}
							name='name'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name</FormLabel>
									<FormControl>
										<Input
											placeholder='John Doe'
											{...field}
											onChange={(e) => {
												field.onChange(e);
												handleFormChange('name', e.target.value);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='username'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Username</FormLabel>
									<FormControl>
										<Input
											placeholder='johndoe'
											{...field}
											onChange={(e) => {
												field.onChange(e);
												handleFormChange('username', e.target.value);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='password'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<PasswordInput
											placeholder='••••••••'
											{...field}
											onChange={(e) => {
												field.onChange(e);
												handleFormChange('password', e.target.value);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='phone'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone Number</FormLabel>
									<FormControl>
										<Input
											autoComplete='off'
											placeholder='+1234567890'
											{...field}
											onChange={(e) => {
												field.onChange(e);
												handleFormChange('phone', e.target.value);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='email'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											autoComplete='off'
											type='email'
											placeholder='john@example.com'
											{...field}
											onChange={(e) => {
												field.onChange(e);
												handleFormChange('email', e.target.value);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type='button'
								variant='outline'
								onClick={() => setIsCreateModalOpen(false)}
								disabled={isSubmitting || isLoading}
							>
								Cancel
							</Button>
							<Button type='submit' disabled={isSubmitting || isLoading}>
								{isSubmitting || isLoading ? (
									<>
										<Loader2 className='mr-2 w-4 h-4 animate-spin' />
										Creating...
									</>
								) : (
									'Create Admin'
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
