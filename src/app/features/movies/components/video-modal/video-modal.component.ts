import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MovieVideoData } from '../../interfaces/movie-form.interface';
import { FormUtils } from '../../utils/form.utils';
import { FORM_VALIDATORS } from '../../constants/validation.constants';

export interface VideoModalData {
  video?: MovieVideoData;
  isEdit: boolean;
}

@Component({
  selector: 'app-video-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="video-modal">
      <h2 mat-dialog-title>
        <mat-icon>{{ data.isEdit ? 'edit' : 'add' }}</mat-icon>
        {{ data.isEdit ? 'Editar Video' : 'Agregar Video' }}
      </h2>

      <mat-dialog-content>
        <form [formGroup]="videoForm" class="video-modal__form">
          <mat-form-field appearance="outline" class="video-modal__field">
            <mat-label>Nombre del Video *</mat-label>
            <input
              matInput
              formControlName="name"
              placeholder="Ej: Trailer Oficial, Behind the Scenes"
            />
            <mat-hint>Nombre descriptivo del video</mat-hint>
            <mat-error>{{ getFieldError('name') }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="video-modal__field">
            <mat-label>URL o ID de YouTube *</mat-label>
            <input
              matInput
              formControlName="urlOrKey"
              placeholder="https://youtu.be/dQw4w9WgXcQ o dQw4w9WgXcQ"
              (blur)="extractYouTubeId()"
            />
            <mat-hint>
              @if (extractedId()) {
              <span class="video-modal__success"
                >✓ ID extraído: {{ extractedId() }}</span
              >
              } @else { Pega la URL completa o solo el ID de 11 caracteres }
            </mat-hint>
            <mat-error>{{ getFieldError('urlOrKey') }}</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="video-modal__field">
            <mat-label>Tipo de Video</mat-label>
            <mat-select formControlName="type">
              <mat-option value="Trailer">Trailer</mat-option>
              <mat-option value="Clip">Clip</mat-option>
              <mat-option value="Teaser">Teaser</mat-option>
              <mat-option value="Behind the Scenes"
                >Behind the Scenes</mat-option
              >
              <mat-option value="Featurette">Featurette</mat-option>
            </mat-select>
          </mat-form-field>

          @if (extractedId()) {
          <div class="video-modal__preview">
            <h4>Vista Previa:</h4>
            <div class="video-modal__thumbnail">
              <img
                [src]="
                  'https://img.youtube.com/vi/' +
                  extractedId() +
                  '/mqdefault.jpg'
                "
                [alt]="videoForm.get('name')?.value || 'Video preview'"
                class="video-modal__thumbnail-img"
              />
              <div class="video-modal__play-overlay">
                <mat-icon>play_arrow</mat-icon>
              </div>
            </div>
          </div>
          }
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
          Cancelar
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="onSave()"
          [disabled]="!canSave()"
        >
          <mat-icon>{{ data.isEdit ? 'save' : 'add' }}</mat-icon>
          {{ data.isEdit ? 'Guardar' : 'Agregar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .video-modal {
        min-width: 500px;
      }

      .video-modal__form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px 0;
      }

      .video-modal__field {
        width: 100%;
      }

      .video-modal__success {
        color: #4caf50;
        font-weight: 500;
      }

      .video-modal__preview {
        margin-top: 16px;
        text-align: center;
      }

      .video-modal__thumbnail {
        position: relative;
        display: inline-block;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .video-modal__thumbnail-img {
        width: 200px;
        height: 112px;
        object-fit: cover;
      }

      .video-modal__play-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.7);
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }
    `,
  ],
})
export class VideoModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<VideoModalComponent>);
  public readonly data = inject<VideoModalData>(MAT_DIALOG_DATA);

  public readonly extractedId = signal<string | null>(null);
  public videoForm: FormGroup;

  constructor() {
    this.videoForm = this.createForm();

    if (this.data.video) {
      this.populateForm(this.data.video);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', FORM_VALIDATORS.videoName],
      urlOrKey: ['', [Validators.required]],
      type: ['Trailer', [Validators.required]],
    });
  }

  private populateForm(video: MovieVideoData): void {
    this.videoForm.patchValue({
      name: video.name,
      urlOrKey: video.key,
      type: video.type,
    });
    this.extractedId.set(video.key);
  }

  public extractYouTubeId(): void {
    const urlOrKey = this.videoForm.get('urlOrKey')?.value;
    const id = FormUtils.extractYouTubeId(urlOrKey);
    this.extractedId.set(id);
  }

  public getFieldError(fieldName: string): string | null {
    return FormUtils.getFieldError(this.videoForm, fieldName);
  }

  public canSave(): boolean {
    return this.videoForm.valid && !!this.extractedId();
  }

  public onSave(): void {
    if (!this.canSave()) return;

    const formValue = this.videoForm.value;
    const video: MovieVideoData = {
      name: formValue.name.trim(),
      key: this.extractedId()!,
      type: formValue.type,
      site: 'YouTube',
      size: 1080,
      official: true,
    };

    this.dialogRef.close(video);
  }

  public onCancel(): void {
    this.dialogRef.close();
  }
}
