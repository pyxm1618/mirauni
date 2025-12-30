import 'package:flutter/material.dart';
import '../../config/constants.dart';
import '../../models/user.dart';
import '../../widgets/common/brutalist_card.dart';

/// 开发者卡片组件 (Brutalist Style)
class DeveloperCard extends StatelessWidget {
  final AppUser developer;
  final VoidCallback? onTap;

  const DeveloperCard({
    super.key,
    required this.developer,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return BrutalistCard(
      child: InkWell(
        onTap: onTap,
        child: Column(
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        developer.displayName.toUpperCase(),
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          height: 1.0,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        color: Colors.black,
                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                        child: Text(
                          developer.skills?.firstOrNull?.toUpperCase() ?? 'DEVELOPER',
                          style: const TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w900,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  '${developer.experience ?? 0} YRS',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
             // Bio
             Text(
               '"${developer.bio ?? ''}"',
               style: const TextStyle(
                 fontWeight: FontWeight.bold,
                 color: AppColors.textSecondary,
                 fontStyle: FontStyle.italic,
               ),
               maxLines: 3,
               overflow: TextOverflow.ellipsis,
             ),
             
             const SizedBox(height: 16),
             
             // Skills
             if (developer.skills != null)
                Wrap(
                  spacing: 4,
                  runSpacing: 4,
                  children: developer.skills!.take(4).map((skill) => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      border: Border.all(color: Colors.black, width: 2),
                    ),
                    child: Text(
                      skill.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  )).toList(),
                ),

             const SizedBox(height: 20),

             // Unlock Button (Static visual)
             Container(
               width: double.infinity,
               padding: const EdgeInsets.symmetric(vertical: 12),
               decoration: BoxDecoration(
                 color: AppColors.secondary,
                 border: Border.all(color: Colors.black, width: 3),
                 boxShadow: const [
                   BoxShadow(
                     color: Colors.black,
                     offset: Offset(4, 4), // Static shadow
                     blurRadius: 0,
                   )
                 ],
               ),
               alignment: Alignment.center,
               child: const Text(
                 'UNLOCK CONTACT (50P)',
                 style: TextStyle(
                   fontSize: 14,
                   fontWeight: FontWeight.w900,
                   color: AppColors.textPrimary,
                   letterSpacing: 0.5,
                 ),
               ),
             )
          ],
        ),
      ),
    );
  }
}
