import type { SubmitFunction } from '@sveltejs/kit';

export function confirmForm(message: string) {
    return function (event: Event) {
        let ok = confirm(message);
        if (!ok) {
            event.preventDefault();
        }
    };
}

export const handleSubmitErrors: SubmitFunction = () => {
    return async ({ result, update }) => {
        if (result.type === 'failure') {
            const errors = result.data?.errors;
            if (errors) {
                const errorMessages = Object.entries(errors)
                    .map(([path, message]) => `- ${path}: ${message}`)
                    .join('\n');
                alert(`Error(s) while submitting form: \n${errorMessages}`);
            }
        } else {
            await update({ reset: false });
        }
    };
};
