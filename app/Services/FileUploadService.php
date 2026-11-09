<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class FileUploadService
{
    /**
     * Store an uploaded file with a unique filename on the public disk.
     */
    public function upload(UploadedFile $file, string $directory = 'products'): string
    {
        $extension = $file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'bin';
        $filename = Str::uuid().'.'.$extension;

        $path = $file->storeAs($directory, $filename, 'public');

        if ($path === false) {
            throw new RuntimeException("Failed to upload file to directory [{$directory}].");
        }

        return $path;
    }

    /**
     * Delete an existing file and upload a new one.
     */
    public function replace(UploadedFile $newFile, ?string $oldPath, string $directory = 'products'): string
    {
        $this->delete($oldPath);

        return $this->upload($newFile, $directory);
    }

    /**
     * Safely delete a file from the public disk if it exists.
     */
    public function delete(?string $path): void
    {
        if (! empty($path) && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
