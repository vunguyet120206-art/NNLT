# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_calculationdata'),
    ]

    operations = [
        # Delete records with null values in hr, ptt, or mbp
        migrations.RunSQL(
            "DELETE FROM api_calculationdata WHERE hr IS NULL OR ptt IS NULL OR mbp IS NULL;",
            reverse_sql=migrations.RunSQL.noop,
        ),
        # Remove input fields
        migrations.RemoveField(
            model_name='calculationdata',
            name='ri',
        ),
        migrations.RemoveField(
            model_name='calculationdata',
            name='ri_next',
        ),
        migrations.RemoveField(
            model_name='calculationdata',
            name='foot_j',
        ),
        migrations.RemoveField(
            model_name='calculationdata',
            name='r_j',
        ),
        migrations.RemoveField(
            model_name='calculationdata',
            name='h',
        ),
        # Make result fields non-nullable
        migrations.AlterField(
            model_name='calculationdata',
            name='hr',
            field=models.FloatField(help_text='Heart Rate (bpm)'),
        ),
        migrations.AlterField(
            model_name='calculationdata',
            name='ptt',
            field=models.FloatField(help_text='Pulse Transit Time (seconds)'),
        ),
        migrations.AlterField(
            model_name='calculationdata',
            name='mbp',
            field=models.FloatField(help_text='Mean Blood Pressure (mmHg)'),
        ),
    ]
